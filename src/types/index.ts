export type ContactGroup = {
  id: string
  name: string
  color: string
  created_at: string
  member_count?: number
}

export type Contact = {
  id: string
  name: string
  phone: string
  active: boolean
  created_at: string
  updated_at: string
  groups?: ContactGroup[]
}

export type Campaign = {
  id: string
  name: string
  message: string
  product_image_url: string | null
  flyer_url: string | null
  flyer_slug: string | null
  audience_type: 'all' | 'group' | 'manual'
  audience_group_id: string | null
  status: 'draft' | 'sending' | 'paused' | 'done' | 'failed'
  total_contacts: number
  sent_count: number
  delivered_count: number
  read_count: number
  failed_count: number
  estimated_cost: number
  real_cost: number | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
  group?: ContactGroup
}

export type AppSettings = {
  id: string
  meta_access_token: string | null
  meta_phone_number_id: string | null
  meta_waba_id: string | null
  meta_api_version: string
  webhook_verify_token: string | null
  send_interval_ms: number
  max_per_hour: number
  auto_retry: boolean
}
