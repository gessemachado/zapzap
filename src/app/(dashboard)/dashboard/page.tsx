import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, Megaphone, Send, CheckCircle, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalContacts },
    { count: activeContacts },
    { count: totalCampaigns },
    { data: recentCampaigns },
    { data: campaignStats },
  ] = await Promise.all([
    supabase.from('contacts').select('id', { count: 'exact', head: true }),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase
      .from('campaigns')
      .select('id, name, status, total_contacts, sent_count, delivered_count, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('campaigns')
      .select('sent_count, delivered_count, read_count, real_cost, estimated_cost')
      .not('status', 'eq', 'draft'),
  ])

  const totalSent = campaignStats?.reduce((a, c) => a + (c.sent_count ?? 0), 0) ?? 0
  const totalDelivered = campaignStats?.reduce((a, c) => a + (c.delivered_count ?? 0), 0) ?? 0
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0

  const STATUS_LABELS: Record<string, string> = {
    draft: 'Rascunho',
    sending: 'Em andamento',
    done: 'Concluída',
    failed: 'Com falhas',
  }

  const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-[#353534] text-zinc-400',
    sending: 'bg-[#4FF07F]/10 text-[#4FF07F] border border-[#4FF07F]/20',
    done: 'bg-[#0d5526]/20 text-[#84c88d]',
    failed: 'bg-[#93000a]/20 text-[#ffb4ab]',
  }

  return (
    <div className="pb-12">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#131313]/80 backdrop-blur-md flex justify-between items-center px-8 h-20 border-b border-white/5">
        <h2 className="font-headline font-bold text-lg text-white">Dashboard</h2>
        <div className="flex items-center gap-6">
          <Link
            href="/campanhas/nova"
            className="metric-gradient text-[#003915] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha
          </Link>
        </div>
      </header>

      <div className="pt-28 flex flex-col gap-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#201F1F] rounded-xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total de Contatos</span>
              <div className="w-8 h-8 rounded-lg bg-[#4FF07F]/10 flex items-center justify-center text-[#4FF07F]">
                <Users className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-headline font-bold text-white leading-none">
                {(totalContacts ?? 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs font-bold text-[#3de273]">
                {activeContacts ?? 0} ativos
              </span>
            </div>
            <div className="mt-4 h-1 w-full bg-[#353534] rounded-full overflow-hidden">
              <div className="h-full bg-[#4FF07F] w-2/3" />
            </div>
          </div>

          <div className="bg-[#201F1F] rounded-xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Campanhas</span>
              <div className="w-8 h-8 rounded-lg bg-[#0d5526] flex items-center justify-center text-[#91d69a]">
                <Megaphone className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-headline font-bold text-white leading-none">
                {totalCampaigns ?? 0}
              </span>
              <span className="text-xs text-zinc-500">no total</span>
            </div>
            <div className="mt-4 flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4FF07F] animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#4FF07F] animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#4FF07F] animate-pulse" />
            </div>
          </div>

          <div className="bg-[#201F1F] rounded-xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Mensagens Enviadas</span>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Send className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-headline font-bold text-white leading-none">
                {totalSent.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="mt-4 flex items-end gap-1 h-6">
              <div className="flex-1 bg-[#353534] rounded-t-sm h-1/2" />
              <div className="flex-1 bg-[#353534] rounded-t-sm h-3/4" />
              <div className="flex-1 bg-[#353534] rounded-t-sm h-1/3" />
              <div className="flex-1 bg-[#4FF07F] rounded-t-sm h-full" />
            </div>
          </div>

          <div className="bg-[#201F1F] rounded-xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Taxa de Sucesso</span>
              <div className="w-8 h-8 rounded-lg bg-[#25d366]/20 flex items-center justify-center text-[#25d366]">
                <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-headline font-bold text-white leading-none">
                {deliveryRate}%
              </span>
            </div>
            <p className="mt-4 text-[10px] text-zinc-500 font-medium">
              {totalDelivered.toLocaleString('pt-BR')} de {totalSent.toLocaleString('pt-BR')} entregues
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-headline font-bold text-white">Últimas Campanhas</h3>
              <Link className="text-sm font-semibold text-[#4FF07F] hover:underline" href="/campanhas">
                Ver todas
              </Link>
            </div>
            <div className="bg-[#1C1B1B] rounded-xl overflow-hidden">
              {!recentCampaigns || recentCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-zinc-500 text-sm">Nenhuma campanha ainda</p>
                  <Link href="/campanhas/nova" className="text-[#4FF07F] text-sm mt-2 hover:underline">
                    Criar primeira campanha →
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#201F1F] text-zinc-500">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Nome da Campanha</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Data</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Contatos</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentCampaigns.map((c) => {
                      const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES.draft
                      const statusLabel = STATUS_LABELS[c.status] ?? 'Rascunho'
                      return (
                        <tr key={c.id} className="hover:bg-[#353534] transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-white">{c.name}</span>
                              <span className="text-[10px] text-zinc-500">ID: {c.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-zinc-400">
                            {new Date(c.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col items-center">
                              <span className="text-sm text-white font-medium">{c.total_contacts}</span>
                              <span className="text-[10px] text-[#3de273]">{c.sent_count} enviados</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusStyle}`}>
                                {statusLabel}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-headline font-bold text-white px-2">Envios nos Últimos 7 Dias</h3>
            <div className="bg-[#1C1B1B] rounded-xl p-6 flex flex-col h-full">
              <div className="flex-1 flex items-end gap-3 min-h-[240px]">
                {[
                  { label: 'SEG', h: '40%', active: false },
                  { label: 'TER', h: '65%', active: false },
                  { label: 'QUA', h: '50%', active: false },
                  { label: 'QUI', h: '85%', active: false },
                  { label: 'SEX', h: '95%', active: true },
                  { label: 'SÁB', h: '30%', active: false },
                  { label: 'DOM', h: '20%', active: false },
                ].map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col gap-2 items-center group">
                    <div
                      className={`w-full rounded-t-lg transition-colors ${
                        bar.active
                          ? 'bg-[#4FF07F]/20 border-t-4 border-[#4FF07F]'
                          : 'bg-[#201F1F] group-hover:bg-zinc-700'
                      }`}
                      style={{ height: bar.h }}
                    />
                    <span className={`text-[10px] font-bold ${bar.active ? 'text-[#4FF07F]' : 'text-zinc-600'}`}>
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4FF07F]" />
                    <span className="text-xs text-zinc-400">Pico de Engajamento</span>
                  </div>
                  <span className="text-xs font-bold text-white">Sexta-feira</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    <span className="text-xs text-zinc-400">Média Diária</span>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {totalSent > 0 ? Math.round(totalSent / 7) : 0} msgs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-[#1C1B1B] rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4FF07F]/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          <div className="relative z-10 max-w-lg">
            <h4 className="text-2xl font-headline font-extrabold text-white mb-2">
              Escale seus resultados com ZapZap Pro
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Libere o envio de botões interativos, automação de fluxo de conversa e inteligência artificial para responder seus leads 24/7.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <button className="bg-[#353534] text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-zinc-700 transition-colors">
              Saiba Mais
            </button>
            <button className="metric-gradient text-[#003915] px-8 py-3 rounded-lg font-bold text-sm shadow-xl shadow-[#4FF07F]/10">
              Upgrade agora
            </button>
          </div>
        </section>
      </div>

      <Link
        href="/campanhas/nova"
        className="fixed bottom-8 right-8 w-14 h-14 metric-gradient rounded-full shadow-2xl shadow-[#4FF07F]/30 flex items-center justify-center text-[#003915] hover:scale-110 active:scale-90 transition-all z-50"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </Link>
    </div>
  )
}
