import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CampaignForm from '@/components/campaigns/campaign-form'

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name, message, product_image_url, flyer_url, flyer_slug, audience_type, audience_group_id, total_contacts, status')
    .eq('id', id)
    .single()

  if (!campaign || !['draft', 'paused'].includes(campaign.status)) notFound()

  const { data: groups } = await supabase
    .from('contact_groups')
    .select('id, name, color, created_at')
    .order('name')

  return (
    <CampaignForm
      groups={groups ?? []}
      campaignId={id}
      initialData={campaign}
    />
  )
}
