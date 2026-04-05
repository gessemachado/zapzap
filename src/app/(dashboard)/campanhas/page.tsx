import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Campaign } from '@/types'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Rascunho', color: '#bbcbb9', bg: '#353534' },
  sending: { label: 'Enviando', color: '#fbbf24', bg: '#fbbf24/15' },
  done: { label: 'Concluída', color: '#4FF07F', bg: '#25D366/15' },
  failed: { label: 'Falhou', color: '#ffb4ab', bg: '#93000a/30' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? STATUS_LABELS.draft
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, backgroundColor: `${s.color}20` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#353534] rounded-full overflow-hidden">
        <div className="h-full bg-[#25D366] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#bbcbb9]">{pct}%</span>
    </div>
  )
}

export default async function CampanhasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('id, name, status, audience_type, total_contacts, sent_count, delivered_count, estimated_cost, created_at')
    .order('created_at', { ascending: false })

  const campaigns = (data ?? []) as Campaign[]

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'sending').length,
    done: campaigns.filter((c) => c.status === 'done').length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Campanhas
          </h1>
          <p className="text-sm text-[#bbcbb9] mt-0.5">{stats.total} campanhas no total</p>
        </div>
        <Link
          href="/campanhas/nova"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#003915]"
          style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova campanha
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: '#bbcbb9' },
          { label: 'Enviando', value: stats.active, color: '#fbbf24' },
          { label: 'Concluídas', value: stats.done, color: '#4FF07F' },
          { label: 'Rascunhos', value: stats.draft, color: '#bbcbb9' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1c1b1b] rounded-xl p-4">
            <p className="text-sm text-[#bbcbb9]">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color, fontFamily: 'Manrope, sans-serif' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* List */}
      {campaigns.length === 0 ? (
        <div className="bg-[#1c1b1b] rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 text-[#3c4a3d] mb-3">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <p className="text-[#bbcbb9]">Nenhuma campanha ainda</p>
          <p className="text-[#3c4a3d] text-sm mt-1 mb-6">Crie sua primeira campanha para começar a enviar mensagens</p>
          <Link
            href="/campanhas/nova"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-[#003915]"
            style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
          >
            Criar campanha
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-[#1c1b1b] rounded-xl p-5 hover:bg-[#201f1f] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {c.name}
                    </h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#bbcbb9] mb-3">
                    <span>
                      {c.audience_type === 'all'
                        ? 'Todos os contatos'
                        : c.audience_type === 'group'
                        ? 'Grupo específico'
                        : 'Seleção manual'}
                    </span>
                    <span>{c.total_contacts} contatos</span>
                    <span>R$ {Number(c.estimated_cost).toFixed(2)}</span>
                    <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {c.status !== 'draft' && (
                    <ProgressBar value={c.sent_count} max={c.total_contacts} />
                  )}
                </div>
                <Link
                  href={`/campanhas/${c.id}`}
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-xs text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
                >
                  Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
