'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Conversation = {
  id: string
  wa_id: string
  phone_number: string
  profile_name: string | null
  status: 'open' | 'pending' | 'closed'
  assigned_to: string | null
  human_mode: boolean
  ai_enabled: boolean
  unread_count: number
  last_message_preview: string | null
  last_message_at: string
  updated_at: string
  created_at: string
  notes: string | null
  appointment_status: 'none' | 'requested' | 'confirmed' | 'cancelled' | 'attended' | 'no_show'
  appointment_requested_at: string | null
  appointment_notes: string | null
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
      } else {
        setConversations(data as Conversation[])
      }
      setLoading(false)
    }

    fetchConversations()

    // Realtime subscription
    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations((prev) => [payload.new as Conversation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setConversations((prev) =>
              prev
                .map((conv) => (conv.id === payload.new.id ? (payload.new as Conversation) : conv))
                .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
            )
          } else if (payload.eventType === 'DELETE') {
            setConversations((prev) => prev.filter((conv) => conv.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { conversations, loading }
}
