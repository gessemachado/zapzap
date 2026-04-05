import { createClient } from '@/lib/supabase/server'
import ContactsClient from '@/components/contacts/contacts-client'
import type { ContactGroup } from '@/types'

export default async function ContatosPage() {
  const supabase = await createClient()

  const { data: groups } = await supabase
    .from('contact_groups')
    .select('id, name, color, created_at')
    .order('name')

  return <ContactsClient initialGroups={(groups ?? []) as ContactGroup[]} />
}
