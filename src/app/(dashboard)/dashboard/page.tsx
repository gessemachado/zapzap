import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
    supabase.from('campaigns')
      .select('id, name, status, total_contacts, sent_count, delivered_count, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('campaigns')
      .select('sent_count, delivered_count, read_count, real_cost, estimated_cost')
      .not('status', 'eq', 'draft'),
  ])

  const totalSent = campaignStats?.reduce((a, c) => a + (c.sent_count ?? 0), 0) ?? 0
  const totalDelivered = campaignStats?.reduce((a, c) => a + (c.delivered_count ?? 0), 0) ?? 0
  const totalCost = campaignStats?.reduce((a, c) => a + Number(c.real_cost ?? c.estimated_cost ?? 0), 0) ?? 0
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0

  const STATUS_COLORS: Record<string, string> = {
    draft: '#bbcbb9',
    sending: '#fbbf24',
    done: '#4FF07F',
    failed: '#ffb4ab',
  }
  const STATUS_LABELS: Record<string, string> = {
    draft: 'Rascunho',
    sending: 'Enviando',
    done: 'Concluída',
    failed: 'Falhou',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Dashboard
        </h1>
        <p className="text-sm text-[#bbcbb9] mt-0.5">Visão geral da plataforma</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Contatos ativos',
            value: (activeContacts ?? 0).toLocaleString('pt-BR'),
            sub: `${(totalContacts ?? 0).toLocaleString('pt-BR')} total`,
            color: '#4FF07F',
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
          {
            label: 'Campanhas',
            value: (totalCampaigns ?? 0).toString(),
            sub: 'no total',
            color: '#bbcbb9',
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            ),
          },
          {
            label: 'Mensagens enviadas',
            value: totalSent.toLocaleString('pt-BR'),
            sub: `${deliveryRate}% taxa de entrega`,
            color: '#4FF07F',
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ),
          },
          {
            label: 'Custo total',
            value: `R$ ${totalCost.toFixed(2)}`,
            sub: 'R$0,13/conversa',
            color: '#4FF07F',
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#1c1b1b] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[#bbcbb9]">{kpi.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: 'Manrope, sans-serif' }}>
              {kpi.value}
            </p>
            <p className="text-xs text-[#bbcbb9] mt-0.5">{kpi.label}</p>
            <p className="text-xs text-[#3c4a3d] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent campaigns */}
        <div className="col-span-2 bg-[#1c1b1b] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#3c4a3d]/20">
            <h2 className="text-white font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Campanhas recentes
            </h2>
            <Link href="/campanhas" className="text-xs text-[#25D366] hover:underline">
              Ver todas
            </Link>
          </div>
          {!recentCampaigns || recentCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[#3c4a3d] text-sm">Nenhuma campanha ainda</p>
              <Link href="/campanhas/nova" className="text-[#25D366] text-sm mt-2 hover:underline">
                Criar primeira campanha →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#3c4a3d]/10">
              {recentCampaigns.map((c) => {
                const color = STATUS_COLORS[c.status] ?? '#bbcbb9'
                const pct = c.total_contacts > 0 ? Math.round((c.sent_count / c.total_contacts) * 100) : 0
                return (
                  <Link key={c.id} href={`/campanhas/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#201f1f] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-medium truncate">{c.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color, backgroundColor: `${color}20` }}>
                          {STATUS_LABELS[c.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[#353534] rounded-full overflow-hidden">
                          <div className="h-full bg-[#25D366] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[#3c4a3d] flex-shrink-0">{c.sent_count}/{c.total_contacts}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#3c4a3d] flex-shrink-0">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <div className="bg-[#1c1b1b] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Ações rápidas
            </h2>
            <div className="space-y-2">
              {[
                { href: '/campanhas/nova', label: 'Nova campanha', icon: '📣' },
                { href: '/contatos', label: 'Gerenciar contatos', icon: '👥' },
                { href: '/historico', label: 'Ver histórico', icon: '📋' },
                { href: '/configuracoes', label: 'Configurações API', icon: '⚙️' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#bbcbb9] hover:text-white hover:bg-[#353534] transition-colors"
                >
                  <span>{action.icon}</span>
                  {action.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 ml-auto opacity-50">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {totalSent > 0 && (
            <div className="bg-[#1c1b1b] rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Taxa de entrega
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-[#4FF07F]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {deliveryRate}%
                </span>
              </div>
              <div className="h-2 bg-[#353534] rounded-full overflow-hidden">
                <div className="h-full bg-[#25D366] rounded-full" style={{ width: `${deliveryRate}%` }} />
              </div>
              <p className="text-xs text-[#3c4a3d] mt-2">
                {totalDelivered.toLocaleString('pt-BR')} de {totalSent.toLocaleString('pt-BR')} entregues
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
