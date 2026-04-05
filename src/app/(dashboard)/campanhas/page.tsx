import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Campaign } from '@/types'
import { Plus, Copy, RefreshCw } from 'lucide-react'
import CampaignActions from '@/components/campaigns/campaign-actions'

function StatusBadge({ status }: { status: string }) {
  if (status === 'sending') {
    return (
      <span className="px-3 py-1 bg-blue-950 text-blue-400 text-[10px] font-bold rounded-full flex items-center gap-1.5 uppercase tracking-wider w-fit">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
        Em Andamento
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span className="px-3 py-1 bg-[#0d5526] text-[#84c88d] text-[10px] font-bold rounded-full flex items-center gap-1.5 uppercase tracking-wider w-fit">
        <span className="w-1.5 h-1.5 bg-[#84c88d] rounded-full" />
        Concluída
      </span>
    )
  }
  if (status === 'paused') {
    return (
      <span className="px-3 py-1 bg-amber-950 text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-1.5 uppercase tracking-wider w-fit">
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
        Pausada
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="px-3 py-1 bg-[#93000a] text-[#ffdad6] text-[10px] font-bold rounded-full flex items-center gap-1.5 uppercase tracking-wider w-fit">
        <span className="w-1.5 h-1.5 bg-[#ffdad6] rounded-full" />
        Com Falhas
      </span>
    )
  }
  return (
    <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-full uppercase tracking-wider w-fit">
      Rascunho
    </span>
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
    failed: campaigns.filter((c) => c.status === 'failed').length,
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#131313]/80 backdrop-blur-md h-20 flex justify-between items-center px-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold font-headline text-white tracking-tight">Campanhas</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/campanhas/nova"
            className="metric-gradient text-[#003915] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nova Campanha
          </Link>
        </div>
      </header>

      <div className="pt-28">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <nav className="flex gap-1 p-1 bg-[#0e0e0e] rounded-xl">
            {[
              { label: 'Todas', count: stats.total, active: true },
              { label: 'Em Andamento', count: stats.active, active: false },
              { label: 'Concluídas', count: stats.done, active: false },
              { label: 'Rascunhos', count: stats.draft, active: false },
              { label: 'Falhas', count: stats.failed, active: false },
            ].map((tab) => (
              <button
                key={tab.label}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab.active
                    ? 'font-semibold text-white bg-[#353534]'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#201F1F] rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-all">
            <span className="text-xs font-medium text-zinc-400">Ordenar por:</span>
            <span className="text-xs font-bold text-white">Mais recente</span>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#201F1F] flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium mb-2">Nenhuma campanha criada</p>
            <p className="text-zinc-600 text-sm mb-6">Crie sua primeira campanha para começar a enviar mensagens</p>
            <Link
              href="/campanhas/nova"
              className="metric-gradient text-[#003915] px-6 py-2.5 rounded-lg font-bold text-sm"
            >
              Criar campanha
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => {
              const pct = c.total_contacts > 0 ? Math.round((c.sent_count / c.total_contacts) * 100) : 0
              const cost = Number(c.estimated_cost ?? 0).toFixed(2)

              return (
                <div key={c.id} className="bg-[#201F1F] rounded-xl p-5 flex flex-col gap-4 group">
                  <div className="flex justify-between items-start">
                    <StatusBadge status={c.status} />
                    <div className="w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-[#4FF07F] transition-colors">
                      {c.name}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-zinc-500/10 text-zinc-500 text-[10px] font-bold rounded-md uppercase">
                      {c.audience_type === 'all'
                        ? 'Todos os contatos'
                        : c.audience_type === 'group'
                        ? 'Grupo específico'
                        : 'Seleção manual'}
                    </span>
                  </div>

                  {c.status !== 'draft' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Progresso</span>
                        <span className="text-white font-bold">
                          {c.sent_count}/{c.total_contacts} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0e0e0e] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full metric-gradient ${c.status === 'failed' ? 'bg-[#ffb4ab]' : ''}`}
                          style={{ width: `${pct}%`, background: c.status === 'failed' ? '#ffb4ab' : undefined }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-xs text-zinc-500 leading-relaxed italic">Campanha não enviada</p>
                      <div className="mt-3 w-full h-1.5 border border-dashed border-zinc-700 rounded-full" />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Enviados</span>
                      <span className="text-sm font-bold text-white">{c.sent_count}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Total</span>
                      <span className="text-sm font-bold text-white">{c.total_contacts}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Custo</span>
                      <span className="text-sm font-bold text-[#4FF07F]">R$ {cost}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/campanhas/${c.id}`}
                      className="flex-1 bg-[#353534] hover:bg-white/10 text-white text-xs font-bold py-2.5 rounded-lg transition-all text-center"
                    >
                      Ver detalhes
                    </Link>
                    {c.status === 'done' && (
                      <button className="flex-1 bg-[#353534] hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
                        <Copy className="w-3.5 h-3.5" />
                        Duplicar
                      </button>
                    )}
                    {c.status === 'failed' && (
                      <button className="flex-1 bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 text-[#ffb4ab] text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reenviar falhas
                      </button>
                    )}
                    <CampaignActions id={c.id} status={c.status} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
