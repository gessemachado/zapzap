'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Contact, ContactGroup } from '@/types'
import PhonePreview from './phone-preview'
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Send,
  Eye,
  Users,
  Tag,
  PenLine,
} from 'lucide-react'

const COST_PER_CONVERSATION = 0.13

type InitialData = {
  name: string
  message: string
  product_image_url: string | null
  flyer_url: string | null
  flyer_slug: string | null
  audience_type: 'all' | 'group' | 'manual'
  audience_group_id: string | null
  total_contacts: number
}

type Props = {
  groups: ContactGroup[]
  campaignId?: string
  initialData?: InitialData
}

export default function CampaignForm({ groups, campaignId, initialData }: Props) {
  const router = useRouter()
  const isEditing = Boolean(campaignId)

  const [name, setName] = useState(initialData?.name ?? '')
  const [message, setMessage] = useState(initialData?.message ?? '')
  const [audienceType, setAudienceType] = useState<'all' | 'group' | 'manual'>(initialData?.audience_type ?? 'all')
  const [audienceGroupId, setAudienceGroupId] = useState(initialData?.audience_group_id ?? '')
  const [manualContacts, setManualContacts] = useState<Contact[]>([])
  const [totalContacts, setTotalContacts] = useState(initialData?.total_contacts ?? 0)

  const [productImageUrl, setProductImageUrl] = useState(initialData?.product_image_url ?? '')
  const [flyerUrl, setFlyerUrl] = useState(initialData?.flyer_url ?? '')
  const [flyerSlug, setFlyerSlug] = useState(initialData?.flyer_slug ?? '')

  const [imageUploading, setImageUploading] = useState(false)
  const [flyerUploading, setFlyerUploading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [contactSearch, setContactSearch] = useState('')
  const [contactResults, setContactResults] = useState<Contact[]>([])
  const [searchingContacts, setSearchingContacts] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const flyerInputRef = useRef<HTMLInputElement>(null)

  const estimatedCost = totalContacts * COST_PER_CONVERSATION

  const updateTotalContacts = useCallback(async (type: string, groupId?: string) => {
    const params = new URLSearchParams()
    if (type === 'group' && groupId) params.set('group', groupId)
    const res = await fetch(`/api/contacts?${params}`)
    if (res.ok) {
      const data: Contact[] = await res.json()
      if (type !== 'manual') setTotalContacts(data.length)
    }
  }, [])

  async function handleAudienceTypeChange(type: 'all' | 'group' | 'manual') {
    setAudienceType(type)
    setManualContacts([])
    if (type !== 'manual') {
      await updateTotalContacts(type, type === 'group' ? audienceGroupId : undefined)
    } else {
      setTotalContacts(0)
    }
  }

  async function handleGroupChange(id: string) {
    setAudienceGroupId(id)
    await updateTotalContacts('group', id)
  }

  async function uploadFile(file: File, bucket: string): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', bucket)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Erro no upload')
    const data = await res.json()
    return data.url as string
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const url = await uploadFile(file, 'assets')
      setProductImageUrl(url)
    } catch {
      setError('Erro ao enviar imagem.')
    }
    setImageUploading(false)
  }

  async function handleFlyerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFlyerUploading(true)
    try {
      const url = await uploadFile(file, 'flyers')
      setFlyerUrl(url)
      const slug = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      setFlyerSlug(`${slug}-${Date.now()}`)
    } catch {
      setError('Erro ao enviar folheto.')
    }
    setFlyerUploading(false)
  }

  async function searchContacts(q: string) {
    if (!q.trim()) { setContactResults([]); return }
    setSearchingContacts(true)
    const res = await fetch(`/api/contacts?search=${encodeURIComponent(q)}`)
    if (res.ok) setContactResults(await res.json())
    setSearchingContacts(false)
  }

  function addManualContact(c: Contact) {
    if (manualContacts.find((m) => m.id === c.id)) return
    const updated = [...manualContacts, c]
    setManualContacts(updated)
    setTotalContacts(updated.length)
    setContactResults([])
    setContactSearch('')
  }

  function removeManualContact(id: string) {
    const updated = manualContacts.filter((c) => c.id !== id)
    setManualContacts(updated)
    setTotalContacts(updated.length)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !message) { setError('Nome e mensagem são obrigatórios.'); return }
    if (audienceType === 'group' && !audienceGroupId) { setError('Selecione um grupo.'); return }
    if (audienceType === 'manual' && manualContacts.length === 0) { setError('Selecione pelo menos 1 contato.'); return }

    setSaving(true)
    setError('')

    const payload = {
      name,
      message,
      product_image_url: productImageUrl || null,
      flyer_url: flyerUrl || null,
      flyer_slug: flyerSlug || null,
      audience_type: audienceType,
      audience_group_id: audienceGroupId || null,
      contact_ids: audienceType === 'manual' ? manualContacts.map((c) => c.id) : [],
      estimated_cost: estimatedCost,
    }

    const res = isEditing
      ? await fetch(`/api/campanhas/${campaignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/campanhas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? (isEditing ? 'Erro ao salvar campanha.' : 'Erro ao criar campanha.'))
    } else {
      const saved = await res.json()
      router.push(`/campanhas/${isEditing ? campaignId : saved.id}`)
    }
  }

  const labelClass = 'text-xs font-bold uppercase tracking-widest text-[#869584]'
  const inputClass =
    'w-full bg-[#0e0e0e] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-[#4FF07F]/50 transition-shadow outline-none placeholder:text-zinc-600 text-sm'

  return (
    <div className="min-h-screen pb-24">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-[#131313]/80 backdrop-blur-md flex items-center px-8 z-40 border-b border-white/5">
        <div className="relative w-96">
          <input
            className="w-full bg-[#1C1B1B] border-none rounded-full pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-[#4FF07F] outline-none placeholder:text-zinc-600"
            placeholder="Pesquisar..."
          />
        </div>
      </header>

      <div className="pt-20 p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 space-y-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/campanhas')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#201F1F] hover:bg-[#353534] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-white">
              {isEditing ? 'Editar Campanha' : 'Nova Campanha'}
            </h1>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-[#93000a]/30 text-[#ffb4ab] text-sm">{error}</div>
          )}

          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1C1B1B] rounded-xl p-6 space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Nome da Campanha</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lançamento Coleção Outono"
                  className={inputClass}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className={labelClass}>Mensagem do WhatsApp</label>
                  <span className="text-[10px] text-[#869584] font-mono">{message.length} / 4096</span>
                </div>
                <div className="relative bg-[#0e0e0e] rounded-lg">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                    rows={6}
                    className="w-full bg-transparent border-none p-4 text-white focus:ring-0 resize-none outline-none text-sm placeholder:text-zinc-600"
                  />
                  <div className="p-3 flex flex-wrap gap-2 border-t border-[#3c4a3d]/10">
                    {['{{nome}}', '{{link}}', '{{valor}}'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setMessage((m) => m + tag)}
                        className="px-3 py-1 bg-[#353534] text-[#4FF07F] text-xs font-semibold rounded-full hover:bg-[#4FF07F]/10 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Imagem do Produto</label>
                {productImageUrl ? (
                  <div className="border-2 border-[#3c4a3d] rounded-xl p-4 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={productImageUrl} alt="Produto" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Imagem carregada</p>
                      <button
                        type="button"
                        onClick={() => setProductImageUrl('')}
                        className="mt-2 text-xs font-bold text-[#4FF07F] hover:underline flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Trocar Imagem
                      </button>
                    </div>
                    <button type="button" onClick={() => setProductImageUrl('')} className="text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-[#3c4a3d] hover:border-[#4FF07F]/50 transition-colors cursor-pointer bg-[#0e0e0e]">
                    {imageUploading ? (
                      <div className="w-5 h-5 border-2 border-[#4FF07F] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-zinc-600 mb-1.5" strokeWidth={1.5} />
                        <span className="text-xs text-zinc-600">Clique para enviar imagem</span>
                        <span className="text-[10px] text-zinc-700 mt-0.5">PNG, JPG até 10MB</span>
                      </>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Folheto Promocional</label>
                {flyerUrl ? (
                  <div className="bg-[#0e0e0e] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#0d5526]/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#4FF07F]" />
                      </div>
                      <div>
                        <span className="text-[10px] bg-[#0d5526] text-[#4FF07F] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                          Link gerado
                        </span>
                        <p className="text-sm font-mono text-[#869584] mt-1">
                          {typeof window !== 'undefined' ? window.location.origin : ''}/f/{flyerSlug}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setFlyerUrl(''); setFlyerSlug('') }} className="text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-[#3c4a3d] hover:border-[#4FF07F]/50 transition-colors cursor-pointer bg-[#0e0e0e]">
                    {flyerUploading ? (
                      <div className="w-5 h-5 border-2 border-[#4FF07F] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FileText className="w-6 h-6 text-zinc-600 mb-1.5" strokeWidth={1.5} />
                        <span className="text-xs text-zinc-600">Enviar folheto</span>
                      </>
                    )}
                    <input ref={flyerInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFlyerUpload} />
                  </label>
                )}
                {flyerSlug && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <p className="text-xs text-[#4FF07F] truncate flex-1">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/f/{flyerSlug}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams({ url: flyerUrl, name, message })
                        window.open(`/f/preview?${params}`, '_blank')
                      }}
                      className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#25D366]/15 text-[#4FF07F] text-xs hover:bg-[#25D366]/25 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Pré-visualizar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1C1B1B] rounded-xl p-6">
              <h3 className="text-white font-semibold font-headline mb-4">Audiência</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {([
                  { value: 'all', label: 'Todos', icon: Users },
                  { value: 'group', label: 'Grupo', icon: Tag },
                  { value: 'manual', label: 'Manual', icon: PenLine },
                ] as const).map((opt) => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleAudienceTypeChange(opt.value)}
                      className={`py-3 rounded-lg text-sm font-medium transition-colors border flex flex-col items-center gap-1 ${
                        audienceType === opt.value
                          ? 'border-[#25D366] bg-[#25D366]/10 text-[#4FF07F]'
                          : 'border-[#3c4a3d] text-zinc-400 hover:border-[#25D366]'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {audienceType === 'group' && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Selecione o grupo</label>
                  <select
                    value={audienceGroupId}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#4FF07F]"
                  >
                    <option value="">Escolha um grupo...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {audienceType === 'manual' && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Buscar contatos</label>
                  <div className="relative">
                    <input
                      value={contactSearch}
                      onChange={(e) => { setContactSearch(e.target.value); searchContacts(e.target.value) }}
                      placeholder="Digite nome ou telefone..."
                      className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#4FF07F] placeholder:text-zinc-600"
                    />
                    {contactResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1C1B1B] border border-[#3c4a3d]/40 rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto shadow-xl">
                        {contactResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => addManualContact(c)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#353534] transition-colors text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#25D366] text-xs">{c.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-white text-sm">{c.name}</p>
                              <p className="text-zinc-600 text-xs font-mono">{c.phone}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchingContacts && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#4FF07F] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {manualContacts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {manualContacts.map((c) => (
                        <span key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D366]/15 text-[#4FF07F] text-xs">
                          {c.name}
                          <button type="button" onClick={() => removeManualContact(c.id)} className="hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#1C1B1B] rounded-xl p-5 border border-[#25D366]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Custo estimado</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {totalContacts} contatos × R$ {COST_PER_CONVERSATION.toFixed(2)}/conversa
                  </p>
                </div>
                <p className="text-3xl font-bold text-[#4FF07F] font-headline">
                  R$ {estimatedCost.toFixed(2)}
                </p>
              </div>
            </div>
          </form>
        </section>

        <section className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex justify-center sticky top-24">
            <PhonePreview
              message={message}
              imageUrl={productImageUrl}
              flyerUrl={flyerUrl}
              flyerSlug={flyerSlug}
            />
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-[#1C1B1B]/80 backdrop-blur-xl border-t border-[#3c4a3d]/10 px-8 py-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-end gap-4">
          <button
            type="submit"
            form="campaign-form"
            disabled={saving}
            className="px-6 py-3 rounded-lg text-white font-semibold bg-[#353534] hover:bg-[#2A2A2A] transition-colors disabled:opacity-60"
          >
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar Rascunho'}
          </button>
          {!isEditing && (
            <button
              type="submit"
              form="campaign-form"
              disabled={saving}
              className="px-8 py-3 rounded-lg bg-[#25D366] text-[#003915] font-bold shadow-lg shadow-[#25D366]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {saving ? 'Criando...' : 'Disparar Campanha'}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
