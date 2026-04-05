import { createClient } from '@/lib/supabase/server'
import CampaignForm from '@/components/campaigns/campaign-form'
import type { ContactGroup } from '@/types'

export default async function NovaCampanhaPage() {
  const supabase = await createClient()
  const { data: groups } = await supabase
    .from('contact_groups')
    .select('id, name, color, created_at')
    .order('name')

  return <CampaignForm groups={(groups ?? []) as ContactGroup[]} />
}
