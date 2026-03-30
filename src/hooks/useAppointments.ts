'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Conversation } from './useConversations'

export type Appointment = {
  id: string
  profile_name: string | null
  phone_number: string
  appointment_status: string
  appointment_requested_at: string | null
  appointment_notes: string | null
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .neq('appointment_status', 'none')
        .order('appointment_requested_at', { ascending: false })

      if (error) {
        console.error('Error fetching appointments:', error)
      } else {
        setAppointments(data as Conversation[])
      }
      setLoading(false)
    }

    fetchAppointments()

    // Realtime subscription
    const channel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const updatedRow = payload.new as Conversation || payload.old as Conversation
          
          if (payload.eventType === 'INSERT') {
            if (updatedRow.appointment_status !== 'none') {
              setAppointments((prev) => [updatedRow, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const isAppointment = updatedRow.appointment_status !== 'none'
            
            setAppointments((prev) => {
              const filtered = prev.filter((a) => a.id !== updatedRow.id)
              if (isAppointment) {
                return [updatedRow, ...filtered].sort((a, b) => {
                  const dateA = a.appointment_requested_at ? new Date(a.appointment_requested_at).getTime() : 0
                  const dateB = b.appointment_requested_at ? new Date(b.appointment_requested_at).getTime() : 0
                  return dateB - dateA
                })
              }
              return filtered
            })
          } else if (payload.eventType === 'DELETE') {
            setAppointments((prev) => prev.filter((a) => a.id !== updatedRow.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { appointments, loading }
}
