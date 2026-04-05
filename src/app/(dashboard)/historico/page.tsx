import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: '#bbcbb9' },
  sending: { label: 'Enviando', color: '#fbbf24' },
  done: { label: 'Concluída', color: '#4FF07F' },
  failed: { label: 'Falhou', color: '#ffb4ab' },
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
  const totalCost = campaigns?.reduce((acc, c) => acc + Number(c.real_cost ?? c.estimated_cost ?? 0), 0) ?? 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Histórico de Envios
        </h1>
        <p className="text-sm text-[#bbcbb9] mt-0.5">Todas as campanhas enviadas</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1c1b1b] rounded-xl p-4">
          <p className="text-sm text-[#bbcbb9]">Campanhas enviadas</p>
          <p className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{total}</p>
        </div>
        <div className="bg-[#1c1b1b] rounded-xl p-4">
          <p className="text-sm text-[#bbcbb9]">Mensagens enviadas</p>
          <p className="text-3xl font-bold text-[#4FF07F] mt-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{totalSent.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-[#1c1b1b] rounded-xl p-4">
          <p className="text-sm text-[#bbcbb9]">Custo total</p>
          <p className="text-3xl font-bold text-[#4FF07F] mt-1" style={{ fontFamily: 'Manrope, sans-serif' }}>R$ {totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      {(!campaigns || campaigns.length === 0) ? (
        <div className="bg-[#1c1b1b] rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 text-[#3c4a3d] mb-3">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-[#bbcbb9]">Nenhum envio realizado</p>
          <p className="text-[#3c4a3d] text-sm mt-1">Crie e envie campanhas para ver o histórico aqui</p>
        </div>
      ) : (
        <div className="bg-[#1c1b1b] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3c4a3d]/20">
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Campanha</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Enviados</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Entregues</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Lidos</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Custo</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Data</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const s = STATUS_LABELS[c.status] ?? STATUS_LABELS.done
                const deliveryRate = c.sent_count > 0 ? Math.round((c.delivered_count / c.sent_count) * 100) : 0
                const readRate = c.sent_count > 0 ? Math.round((c.read_count / c.sent_count) * 100) : 0
                return (
                  <tr key={c.id} className="border-b border-[#3c4a3d]/10 hover:bg-[#201f1f] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-[#3c4a3d] text-xs mt-0.5">{c.total_contacts} contatos</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: s.color, backgroundColor: `${s.color}20` }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-white">{c.sent_count}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-[#4FF07F]">{c.delivered_count}</p>
                      <p className="text-[#3c4a3d] text-xs">{deliveryRate}%</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-[#53bdeb]">{c.read_count}</p>
                      <p className="text-[#3c4a3d] text-xs">{readRate}%</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-[#4FF07F] font-medium">
                        R$ {Number(c.real_cost ?? c.estimated_cost ?? 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right text-[#bbcbb9] text-xs">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/campanhas/${c.id}`}
                        className="text-xs text-[#bbcbb9] hover:text-white underline underline-offset-2"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
