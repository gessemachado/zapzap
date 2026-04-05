import { createClient } from '@/lib/supabase/server'
import SettingsClient from './settings-client'
import type { AppSettings } from '@/types'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('app_settings').select('*').single()

  return <SettingsClient initialSettings={settings as AppSettings} />
}
