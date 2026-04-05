'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Contact, ContactGroup } from '@/types'
import PhonePreview from './phone-preview'

const COST_PER_CONVERSATION = 0.13

type Props = {
  groups: ContactGroup[]
}

export default function CampaignForm({ groups }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [audienceType, setAudienceType] = useState<'all' | 'group' | 'manual'>('all')
  const [audienceGroupId, setAudienceGroupId] = useState('')
  const [manualContacts, setManualContacts] = useState<Contact[]>([])
  const [totalContacts, setTotalContacts] = useState(0)

  const [productImageUrl, setProductImageUrl] = useState('')
  const [flyerUrl, setFlyerUrl] = useState('')
  const [flyerSlug, setFlyerSlug] = useState('')

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

  // Fetch total contacts count based on audience
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
      // generate slug from filename
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

    const res = await fetch('/api/campanhas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        message,
        product_image_url: productImageUrl || null,
        flyer_url: flyerUrl || null,
        flyer_slug: flyerSlug || null,
        audience_type: audienceType,
        audience_group_id: audienceGroupId || null,
        contact_ids: audienceType === 'manual' ? manualContacts.map((c) => c.id) : [],
        estimated_cost: estimatedCost,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao criar campanha.')
      return
    }

    router.push('/campanhas')
    router.refresh()
  }

  return (
    <div className="flex gap-8 items-start">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6 max-w-2xl">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-[#93000a]/30 text-[#ffb4ab] text-sm">{error}</div>
        )}

        {/* Campaign name */}
        <div className="bg-[#1c1b1b] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Informações da campanha
          </h3>
          <label className="block text-sm text-[#bbcbb9] mb-1.5">Nome da campanha</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Promoção Verão 2026"
            className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
          />
        </div>

        {/* Message */}
        <div className="bg-[#1c1b1b] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Mensagem
          </h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder="Olá! Temos uma promoção especial para você..."
            className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d] resize-none"
          />
          <p className="text-xs text-[#3c4a3d] mt-1">{message.length} caracteres</p>
        </div>

        {/* Images */}
        <div className="bg-[#1c1b1b] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Mídia (opcional)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Product image */}
            <div>
              <label className="block text-sm text-[#bbcbb9] mb-2">Imagem do produto</label>
              {productImageUrl ? (
                <div className="relative rounded-lg overflow-hidden bg-[#0e0e0e] h-28">
                  <img src={productImageUrl} alt="Produto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setProductImageUrl('')}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-[#3c4a3d] hover:border-[#25D366] transition-colors cursor-pointer bg-[#0e0e0e]">
                  {imageUploading ? (
                    <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[#3c4a3d] mb-1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="text-xs text-[#3c4a3d]">Enviar imagem</span>
                    </>
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {/* Flyer */}
            <div>
              <label className="block text-sm text-[#bbcbb9] mb-2">Folheto promocional</label>
              {flyerUrl ? (
                <div className="relative rounded-lg bg-[#0e0e0e] h-28 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={1.5} className="w-6 h-6 mb-1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  <span className="text-[#4FF07F] text-xs">Folheto carregado</span>
                  <button
                    type="button"
                    onClick={() => { setFlyerUrl(''); setFlyerSlug('') }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-[#3c4a3d] hover:border-[#25D366] transition-colors cursor-pointer bg-[#0e0e0e]">
                  {flyerUploading ? (
                    <div className="w-5 h-5 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[#3c4a3d] mb-1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      <span className="text-xs text-[#3c4a3d]">Enviar folheto</span>
                    </>
                  )}
                  <input ref={flyerInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFlyerUpload} />
                </label>
              )}
              {flyerSlug && (
                <p className="text-xs text-[#25D366] mt-1 truncate">{typeof window !== 'undefined' ? window.location.origin : ''}/f/{flyerSlug}</p>
              )}
            </div>
          </div>
        </div>

        {/* Audience */}
        <div className="bg-[#1c1b1b] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Audiência
          </h3>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {([
              { value: 'all', label: 'Todos', icon: '👥' },
              { value: 'group', label: 'Grupo', icon: '🏷️' },
              { value: 'manual', label: 'Manual', icon: '✍️' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAudienceTypeChange(opt.value)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  audienceType === opt.value
                    ? 'border-[#25D366] bg-[#25D366]/10 text-[#4FF07F]'
                    : 'border-[#3c4a3d] text-[#bbcbb9] hover:border-[#25D366]'
                }`}
              >
                <span className="block text-base mb-0.5">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {audienceType === 'group' && (
            <div>
              <label className="block text-sm text-[#bbcbb9] mb-1.5">Selecione o grupo</label>
              <select
                value={audienceGroupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366]"
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
              <label className="block text-sm text-[#bbcbb9] mb-1.5">Buscar contatos</label>
              <div className="relative">
                <input
                  value={contactSearch}
                  onChange={(e) => { setContactSearch(e.target.value); searchContacts(e.target.value) }}
                  placeholder="Digite nome ou telefone..."
                  className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
                />
                {contactResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c1b1b] border border-[#3c4a3d]/40 rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto shadow-xl">
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
                          <p className="text-[#3c4a3d] text-xs font-mono">{c.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchingContacts && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {manualContacts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {manualContacts.map((c) => (
                    <span key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D366]/15 text-[#4FF07F] text-xs">
                      {c.name}
                      <button type="button" onClick={() => removeManualContact(c.id)} className="hover:text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cost card */}
        <div className="bg-[#1c1b1b] rounded-xl p-5 border border-[#25D366]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#bbcbb9] text-sm">Custo estimado</p>
              <p className="text-xs text-[#3c4a3d] mt-0.5">
                {totalContacts} contatos × R$ {COST_PER_CONVERSATION.toFixed(2)}/conversa
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#4FF07F]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                R$ {estimatedCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/campanhas')}
            className="flex-1 py-3 rounded-lg text-sm text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-lg text-sm font-semibold text-[#003915] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
          >
            {saving ? 'Salvando...' : 'Criar campanha'}
          </button>
        </div>
      </form>

      {/* Phone preview */}
      <div className="flex-shrink-0 hidden xl:block sticky top-8">
        <PhonePreview
          message={message}
          imageUrl={productImageUrl}
          flyerUrl={flyerUrl}
          flyerSlug={flyerSlug}
        />
      </div>
    </div>
  )
}
