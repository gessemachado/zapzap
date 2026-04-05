import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: '#bbcbb9' },
  sending: { label: 'Enviando', color: '#fbbf24' },
  done: { label: 'Concluída', color: '#4FF07F' },
  failed: { label: 'Falhou', color: '#ffb4ab' },
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#4FF07F]/10 text-[#4FF07F] px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
        Concluída
      </span>
    )
  }
  if (status === 'sending') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
        Enviando
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#93000a]/20 text-[#ffb4ab] px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
        Falhou
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
      Rascunho
    </span>
  )
}

export default async function HistoricoPage() {
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, total_contacts, sent_count, delivered_count, read_count, failed_count, estimated_cost, real_cost, started_at, finished_at, created_at')
    .not('status', 'eq', 'draft')
    .order('created_at', { ascending: false })

  const total = campaigns?.length ?? 0
  const totalSent = campaigns?.reduce((acc, c) => acc + (c.sent_count ?? 0), 0) ?? 0
  const totalDelivered = campaigns?.reduce((acc, c) => acc + (c.delivered_count ?? 0), 0) ?? 0
  const totalRead = campaigns?.reduce((acc, c) => acc + (c.read_count ?? 0), 0) ?? 0
  const totalFailed = campaigns?.reduce((acc, c) => acc + (c.failed_count ?? 0), 0) ?? 0
  const totalCost = campaigns?.reduce((acc, c) => acc + Number(c.real_cost ?? c.estimated_cost ?? 0), 0) ?? 0

  const sentPct = totalSent > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 100) : 0
  const deliveryPct = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0
  const readPct = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0
  const failedPct = totalSent > 0 ? Math.round((totalFailed / totalSent) * 100) : 0

  return (
    <div className="min-h-screen pb-12">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-[#131313]/80 backdrop-blur-md flex justify-between items-center px-8 border-b border-white/5 z-40">
        <div className="flex items-center gap-4 bg-[#0e0e0e] px-4 py-1.5 rounded-full border border-white/5">
          <span className="text-zinc-500 text-sm">Buscar...</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white font-bold font-headline text-sm tracking-tight">ZapZap Marketing Pro</span>
        </div>
      </header>

      <div className="pt-24">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white font-headline tracking-tight">Histórico de Envios</h2>
            <p className="text-zinc-500 mt-2 text-sm max-w-xl">
              Gerencie e monitore o status em tempo real de cada mensagem enviada através das suas campanhas ativas.
            </p>
          </div>
          <button className="metric-gradient text-[#003915] px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#4FF07F]/10 hover:scale-[1.02] transition-transform w-fit">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-[#201F1F] p-6 rounded-xl border border-white/5 relative overflow-hidden">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total Campanhas</span>
            <h3 className="text-3xl font-black text-white font-headline">{total}</h3>
            <div className="absolute bottom-0 right-0 w-1/3 h-12 bg-[#4FF07F]/10 -rotate-12 translate-y-4 translate-x-4" />
          </div>

          {[
            { label: 'Enviados', value: sentPct, color: '#4FF07F' },
            { label: 'Entregues', value: deliveryPct, color: '#91d69a' },
            { label: 'Lidos', value: readPct, color: '#60a5fa' },
            { label: 'Falhas', value: failedPct, color: '#ffb4ab', error: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#201F1F] p-6 rounded-xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${stat.error ? 'text-[#ffb4ab]' : 'text-zinc-500'}`}>
                  {stat.label}
                </span>
                <div className="flex items-center gap-3">
                  <h3 className={`text-2xl font-black font-headline ${stat.error ? 'text-[#ffb4ab]' : 'text-white'}`}>
                    {stat.value}%
                  </h3>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${stat.value}%`, backgroundColor: stat.color }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1C1B1B] p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center border border-white/5">
          <div className="flex-1 flex gap-4">
            <div className="relative min-w-[200px]">
              <select className="w-full bg-[#0e0e0e] border-none text-zinc-400 text-xs font-bold rounded-lg py-2.5 px-4 appearance-none focus:ring-1 focus:ring-[#4FF07F]/50 outline-none">
                <option>Campanha: Todas</option>
                {campaigns?.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[180px]">
              <select className="w-full bg-[#0e0e0e] border-none text-zinc-400 text-xs font-bold rounded-lg py-2.5 px-4 appearance-none focus:ring-1 focus:ring-[#4FF07F]/50 outline-none">
                <option>Status: Todos</option>
                <option>Enviado</option>
                <option>Entregue</option>
                <option>Lido</option>
                <option>Falhou</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            <span>Filtrando por: </span>
            <span className="text-[#4FF07F]">Todas as campanhas</span>
          </div>
        </div>

        {(!campaigns || campaigns.length === 0) ? (
          <div className="bg-[#201F1F] rounded-2xl flex flex-col items-center justify-center py-24 text-center border border-white/5">
            <p className="text-zinc-400 font-medium mb-2">Nenhum envio realizado</p>
            <p className="text-zinc-600 text-sm mt-1">Crie e envie campanhas para ver o histórico aqui</p>
          </div>
        ) : (
          <div className="bg-[#201F1F] rounded-2xl overflow-hidden border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1C1B1B] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Campanha</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Enviados</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Entregues</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lidos</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Custo</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((c) => {
                  const deliveryRate = c.sent_count > 0 ? Math.round((c.delivered_count / c.sent_count) * 100) : 0
                  const readRate = c.sent_count > 0 ? Math.round((c.read_count / c.sent_count) * 100) : 0
                  const initials = c.name
                    .split(' ')
                    .slice(0, 2)
                    .map((w: string) => w[0])
                    .join('')
                    .toUpperCase()

                  return (
                    <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#353534] flex items-center justify-center text-[10px] font-bold text-[#4FF07F]">
                            {initials}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white">{c.name}</span>
                            <p className="text-[10px] text-zinc-600">{c.total_contacts} contatos</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{c.sent_count}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#4FF07F] font-medium">{c.delivered_count}</span>
                        <p className="text-[10px] text-zinc-600">{deliveryRate}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-blue-400 font-medium">{c.read_count}</span>
                        <p className="text-[10px] text-zinc-600">{readRate}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-[#4FF07F] font-medium">
                          R$ {Number(c.real_cost ?? c.estimated_cost ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/campanhas/${c.id}`}
                          className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-[#4FF07F] transition-colors"
                        >
                          Visualizar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="px-6 py-4 bg-[#1C1B1B] flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Mostrando 1-{campaigns.length} de {campaigns.length}
              </span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0e0e0e] text-zinc-500 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#4FF07F] text-[#003915] text-[10px] font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0e0e0e] text-zinc-500 hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
