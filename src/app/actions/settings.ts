'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Setting = {
  id: string
  category: string
  key: string
  value: string | null
  updated_at: string
}

export async function getSettingsByCategory(category: string): Promise<Setting[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('category', category)
    .order('key')

  if (error) {
    console.error('Error fetching settings:', error)
    return []
  }

  return data as Setting[]
}

export async function getAllSettings(): Promise<Setting[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('category')
    .order('key')

  if (error) {
    console.error('Error fetching all settings:', error)
    return []
  }

  return data as Setting[]
}

export async function updateSetting(
  category: string,
  key: string,
  value: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('settings')
    .upsert(
      {
        category,
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: 'category,key' }
    )

  if (error) {
    console.error('Error updating setting:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function getSettingValue(
  category: string,
  key: string
): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('category', category)
    .eq('key', key)
    .single()

  if (error || !data) return null
  return data.value
}
