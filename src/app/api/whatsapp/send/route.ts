import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function getSettingOrEnv(
  supabase: Awaited<ReturnType<typeof createClient>>,
  category: string,
  key: string,
  envKey: string
): Promise<string | undefined> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('category', category)
    .eq('key', key)
    .single()

  if (data?.value) return data.value
  return process.env[envKey] || undefined
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, text } = await req.json()

    if (!conversationId || !text) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // 1. Fetch conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // 2. Call WhatsApp Cloud API (DB settings take priority over env vars)
    const whatsappToken = await getSettingOrEnv(supabase, 'whatsapp', 'access_token', 'WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = await getSettingOrEnv(supabase, 'whatsapp', 'phone_number_id', 'WHATSAPP_PHONE_NUMBER_ID')
    const apiVersion = await getSettingOrEnv(supabase, 'whatsapp', 'api_version', 'WHATSAPP_API_VERSION') || 'v20.0'


    const waResponse = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: conversation.wa_id,
          type: 'text',
          text: { preview_url: false, body: text },
        }),
      }
    )

    const waData = await waResponse.json()

    if (!waResponse.ok) {
      console.error('WhatsApp API Error:', waData)
      return NextResponse.json({ error: 'WhatsApp API error', details: waData }, { status: 502 })
    }

    const waMessageId = waData.messages?.[0]?.id

    // 3. Insert outbound message into DB
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        direction: 'outbound',
        sender_type: 'agent',
        agent_id: user.id,
        content_text: text,
        whatsapp_message_id: waMessageId,
        raw_payload: waData,
      })
      .select()
      .single()

    if (msgError) {
      console.error('DB Insert Error:', msgError)
      return NextResponse.json({ 
        error: 'Failed to log message', 
        details: msgError.message,
        hint: msgError.hint,
        code: msgError.code
      }, { status: 500 })
    }

    // 4. Update conversation metadata
    await supabase
      .from('conversations')
      .update({
        last_message_preview: text,
        last_message_at: new Date().toISOString(),
        unread_count: 0, // Reset unread count on reply
      })
      .eq('id', conversationId)

    // 5. Log event (Safely)
    try {
      await supabase.from('conversation_events').insert({
        conversation_id: conversationId,
        event_type: 'message_sent',
        actor_id: user.id,
        payload: { message_id: message.id },
      })
    } catch (e) {
      console.warn('Optional: failed to log conversation_event', e)
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Handler Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
