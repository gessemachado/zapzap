import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CampaignForm from '@/components/campaigns/campaign-form'
import type { ContactGroup } from '@/types'

export default async function NovaCampanhaPage() {
  const supabase = await createClient()
  const { data: groups } = await supabase
    .from('contact_groups')
    .select('id, name, color, created_at')
    .order('name')

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/campanhas"
          className="p-2 rounded-lg text-[#bbcbb9] hover:text-white hover:bg-[#1c1b1b] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Nova campanha
          </h1>
          <p className="text-sm text-[#bbcbb9] mt-0.5">Configure e envie sua mensagem de marketing</p>
        </div>
      </div>

      <CampaignForm groups={(groups ?? []) as ContactGroup[]} />
    </div>
  )
}
