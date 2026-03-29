'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Message = {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  sender_type: 'customer' | 'ai' | 'agent' | 'system'
  agent_id: string | null
  content_text: string | null
  created_at: string
}

export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let ignore = false

    const fetchMessages = async () => {
      if (!conversationId) {
        setMessages((prev) => (prev.length > 0 ? [] : prev))
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (!ignore) {
        if (error) {
          console.error('Error fetching messages:', error)
        } else {
          setMessages(data as Message[])
        }
        setLoading(false)
      }
    }

    fetchMessages()

    if (!conversationId) return

    const channel = supabase
      .channel(`messages_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!ignore) {
            setMessages((prev) => [...prev, payload.new as Message])
          }
        }
      )
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  return { messages, loading }
}
