import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: '#bbcbb9' },
  sending: { label: 'Enviando', color: '#fbbf24' },
  done: { label: 'Concluída', color: '#4FF07F' },
  failed: { label: 'Falhou', color: '#ffb4ab' },
}

const SEND_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: '#bbcbb9' },
  sent: { label: 'Enviado', color: '#4FF07F' },
  delivered: { label: 'Entregue', color: '#25D366' },
  read: { label: 'Lido', color: '#53bdeb' },
  failed: { label: 'Falhou', color: '#ffb4ab' },
}

export default async function CampanhaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select(`
      *,
      group:contact_groups(id, name, color)
    `)
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: sends } = await supabase
    .from('campaign_sends')
    .select('id, status, sent_at, delivered_at, read_at, contact:contacts(id, name, phone)')
    .eq('campaign_id', id)
    .order('created_at')

  const s = STATUS_LABELS[campaign.status] ?? STATUS_LABELS.draft

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/campanhas"
          className="p-2 rounded-lg text-[#bbcbb9] hover:text-white hover:bg-[#1c1b1b] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {campaign.name}
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ color: s.color, backgroundColor: `${s.color}20` }}
            >
              {s.label}
            </span>
          </div>
          <p className="text-sm text-[#bbcbb9] mt-0.5">
            Criada em {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — campaign info */}
        <div className="col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: campaign.total_contacts, color: '#bbcbb9' },
              { label: 'Enviados', value: campaign.sent_count, color: '#4FF07F' },
              { label: 'Entregues', value: campaign.delivered_count, color: '#25D366' },
              { label: 'Lidos', value: campaign.read_count, color: '#53bdeb' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1c1b1b] rounded-xl p-4 text-center">
                <p className="text-xs text-[#bbcbb9]">{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: stat.color, fontFamily: 'Manrope, sans-serif' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Message */}
          <div className="bg-[#1c1b1b] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Mensagem</h3>
            <p className="text-[#bbcbb9] text-sm whitespace-pre-wrap">{campaign.message}</p>
            {campaign.flyer_slug && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-[#0e0e0e] rounded-lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <a
                  href={`/f/${campaign.flyer_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] text-sm hover:underline truncate"
                >
                  /f/{campaign.flyer_slug}
                </a>
              </div>
            )}
          </div>

          {/* Sends table */}
          {sends && sends.length > 0 && (
            <div className="bg-[#1c1b1b] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#3c4a3d]/20">
                <h3 className="text-white font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Envios ({sends.length})
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#3c4a3d]/20">
                    <th className="px-5 py-3 text-left text-xs text-[#bbcbb9] font-medium uppercase tracking-wider">Contato</th>
                    <th className="px-5 py-3 text-left text-xs text-[#bbcbb9] font-medium uppercase tracking-wider">Telefone</th>
                    <th className="px-5 py-3 text-left text-xs text-[#bbcbb9] font-medium uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs text-[#bbcbb9] font-medium uppercase tracking-wider">Enviado em</th>
                  </tr>
                </thead>
                <tbody>
                  {sends.map((send) => {
                    const st = SEND_STATUS_LABELS[send.status] ?? SEND_STATUS_LABELS.pending
                    const contact = send.contact as unknown as { name: string; phone: string } | null
                    return (
                      <tr key={send.id} className="border-b border-[#3c4a3d]/10 hover:bg-[#201f1f] transition-colors">
                        <td className="px-5 py-3 text-white">{contact?.name ?? '-'}</td>
                        <td className="px-5 py-3 text-[#bbcbb9] font-mono text-xs">{contact?.phone ?? '-'}</td>
                        <td className="px-5 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ color: st.color, backgroundColor: `${st.color}20` }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#bbcbb9] text-xs">
                          {send.sent_at
                            ? new Date(send.sent_at).toLocaleString('pt-BR')
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right — summary */}
        <div className="space-y-4">
          <div className="bg-[#1c1b1b] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Resumo</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-[#3c4a3d] uppercase tracking-wider">Audiência</dt>
                <dd className="text-sm text-[#bbcbb9] mt-0.5">
                  {campaign.audience_type === 'all'
                    ? 'Todos os contatos'
                    : campaign.audience_type === 'group'
                    ? `Grupo: ${(campaign.group as { name: string } | null)?.name ?? '-'}`
                    : 'Seleção manual'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#3c4a3d] uppercase tracking-wider">Custo estimado</dt>
                <dd className="text-sm text-[#4FF07F] font-semibold mt-0.5">
                  R$ {Number(campaign.estimated_cost).toFixed(2)}
                </dd>
              </div>
              {campaign.real_cost != null && (
                <div>
                  <dt className="text-xs text-[#3c4a3d] uppercase tracking-wider">Custo real</dt>
                  <dd className="text-sm text-[#4FF07F] font-semibold mt-0.5">
                    R$ {Number(campaign.real_cost).toFixed(2)}
                  </dd>
                </div>
              )}
              {campaign.failed_count > 0 && (
                <div>
                  <dt className="text-xs text-[#3c4a3d] uppercase tracking-wider">Falhas</dt>
                  <dd className="text-sm text-[#ffb4ab] font-semibold mt-0.5">{campaign.failed_count}</dd>
                </div>
              )}
            </dl>
          </div>

          {campaign.product_image_url && (
            <div className="bg-[#1c1b1b] rounded-xl overflow-hidden">
              <img src={campaign.product_image_url} alt="Produto" className="w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
