'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pause, Play, Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'

type Props = {
  id: string
  status: string
}

export default function CampaignActions({ id, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePause() {
    setLoading(true)
    await fetch(`/api/campanhas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused' }),
    })
    setLoading(false)
    router.refresh()
  }

  async function handleResume() {
    setLoading(true)
    await fetch(`/api/campanhas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Excluir esta campanha?')) return
    setLoading(true)
    await fetch(`/api/campanhas/${id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  if (status === 'sending') {
    return (
      <button
        onClick={handlePause}
        disabled={loading}
        title="Pausar envio"
        className="w-10 bg-[#353534] hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 flex items-center justify-center rounded-lg transition-all disabled:opacity-50"
      >
        <Pause className="w-4 h-4" />
      </button>
    )
  }

  if (status === 'paused') {
    return (
      <>
        <button
          onClick={handleResume}
          disabled={loading}
          title="Retomar como rascunho"
          className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          Retomar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          title="Excluir campanha"
          className="w-10 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] flex items-center justify-center rounded-lg transition-all disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </>
    )
  }

  if (status === 'draft') {
    return (
      <>
        <Link
          href={`/campanhas/${id}/editar`}
          className="flex-1 bg-[#353534] hover:bg-white/10 text-[#4FF07F] text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Link>
        <button
          onClick={handleDelete}
          disabled={loading}
          title="Excluir campanha"
          className="w-10 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] flex items-center justify-center rounded-lg transition-all disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </>
    )
  }

  return null
}
