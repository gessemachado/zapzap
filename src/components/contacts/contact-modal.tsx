'use client'

import { useEffect, useRef, useState } from 'react'
import type { Contact, ContactGroup } from '@/types'

type Props = {
  contact?: Contact | null
  groups: ContactGroup[]
  onClose: () => void
  onSaved: () => void
}

export default function ContactModal({ contact, groups, onClose, onSaved }: Props) {
  const [name, setName] = useState(contact?.name ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [active, setActive] = useState(contact?.active ?? true)
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    contact?.groups?.map((g) => g.id) ?? []
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  function toggleGroup(id: string) {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = { name, phone, active, group_ids: selectedGroups }
    const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts'
    const method = contact ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar contato.')
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-[#1c1b1b] rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {contact ? 'Editar contato' : 'Novo contato'}
          </h2>
          <button onClick={onClose} className="text-[#bbcbb9] hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-[#93000a]/30 text-[#ffb4ab] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#bbcbb9] mb-1.5">Nome</label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome completo"
              className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#bbcbb9] mb-1.5">Telefone (com DDI)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="5511999999999"
              className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
            />
            <p className="text-xs text-[#3c4a3d] mt-1">Formato: DDI + DDD + número (ex: 5511999999999)</p>
          </div>

          {groups.length > 0 && (
            <div>
              <label className="block text-sm text-[#bbcbb9] mb-2">Grupos</label>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const selected = selectedGroups.includes(g.id)
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGroup(g.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? 'border-transparent text-[#131313]'
                          : 'border-[#3c4a3d] text-[#bbcbb9] bg-transparent hover:border-[#25D366]'
                      }`}
                      style={selected ? { backgroundColor: g.color } : {}}
                    >
                      {g.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[#bbcbb9]">Contato ativo</span>
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                active ? 'bg-[#25D366]' : 'bg-[#353534]'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg text-sm text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg text-sm font-semibold text-[#003915] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
