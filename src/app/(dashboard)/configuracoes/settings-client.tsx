'use client'

import { useState } from 'react'
import type { AppSettings } from '@/types'
import { Eye, EyeOff, Copy, RefreshCw, Save } from 'lucide-react'

type Props = {
  initialSettings: AppSettings | null
}

export default function SettingsClient({ initialSettings }: Props) {
  const s = initialSettings
  const [token, setToken] = useState(s?.meta_access_token ?? '')
  const [phoneId, setPhoneId] = useState(s?.meta_phone_number_id ?? '')
  const [wabaId, setWabaId] = useState(s?.meta_waba_id ?? '')
  const [apiVersion, setApiVersion] = useState(s?.meta_api_version ?? 'v19.0')
  const [webhookToken, setWebhookToken] = useState(s?.webhook_verify_token ?? '')
  const [intervalMs, setIntervalMs] = useState(s?.send_interval_ms ?? 1000)
  const [maxPerHour, setMaxPerHour] = useState(s?.max_per_hour ?? 200)
  const [autoRetry, setAutoRetry] = useState(s?.auto_retry ?? true)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showToken, setShowToken] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const isConnected = !!(token && phoneId && wabaId)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meta_access_token: token,
        meta_phone_number_id: phoneId,
        meta_waba_id: wabaId,
        meta_api_version: apiVersion,
        webhook_verify_token: webhookToken,
        send_interval_ms: intervalMs,
        max_per_hour: maxPerHour,
        auto_retry: autoRetry,
      }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await handleSave()
  }

  const inputClass =
    'w-full bg-[#0e0e0e] border-none rounded-lg p-4 text-sm text-white focus:ring-1 focus:ring-[#4FF07F]/50 transition-all outline-none placeholder:text-zinc-600'

  const labelClass = 'text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 block mb-2'

  return (
    <div className="min-h-screen pb-32">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#131313]/80 backdrop-blur-md flex justify-between items-center px-8 h-20">
        <h2 className="text-[1.75rem] font-bold font-headline text-white">Configurações</h2>
      </header>

      <div className="pt-28 px-4 max-w-4xl mx-auto space-y-8">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-[#93000a]/30 text-[#ffb4ab] text-sm">{error}</div>
        )}
        {saved && (
          <div className="px-4 py-3 rounded-lg bg-[#25D366]/20 text-[#4FF07F] text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            Configurações salvas com sucesso!
          </div>
        )}

        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-[#1C1B1B] rounded-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold font-headline text-white mb-1">
                  Integração WhatsApp Business (Meta)
                </h3>
                <p className="text-zinc-500 text-sm">Conecte sua conta oficial para iniciar os disparos.</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isConnected
                    ? 'bg-[#0d5526]/20 text-[#84c88d] border-[#0d5526]'
                    : 'bg-[#93000a]/20 text-[#ffb4ab] border-[#ffb4ab]/20'
                }`}
              >
                {isConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className={labelClass}>Token de Acesso</label>
                <div className="relative">
                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    type={showToken ? 'text' : 'password'}
                    placeholder="EAAxxxxxxxxx..."
                    className={`${inputClass} font-mono pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 cursor-pointer hover:text-zinc-300"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>ID do Número de Telefone</label>
                  <input
                    value={phoneId}
                    onChange={(e) => setPhoneId(e.target.value)}
                    placeholder="123456789012345"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>WABA ID</label>
                  <input
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="987654321098765"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Versão da API:</span>
                  <select
                    value={apiVersion}
                    onChange={(e) => setApiVersion(e.target.value)}
                    className="bg-transparent border-none text-sm font-mono text-zinc-500 outline-none"
                  >
                    <option>v22.0</option>
                    <option>v21.0</option>
                    <option>v20.0</option>
                    <option>v19.0</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 transition-all"
                  >
                    Testar Conexão
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2.5 rounded-lg text-[#003915] text-sm font-bold shadow-lg shadow-[#4FF07F]/10 hover:brightness-110 transition-all metric-gradient disabled:opacity-60"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#1C1B1B] rounded-xl p-8 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-xl font-bold font-headline text-white mb-1">Webhook</h3>
              <p className="text-zinc-500 text-sm">Receba notificações em tempo real sobre suas mensagens.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>URL de Callback</label>
                <div className="flex items-center bg-[#0e0e0e] rounded-lg overflow-hidden">
                  <input
                    className="flex-1 bg-transparent border-none p-4 text-sm text-zinc-400 focus:ring-0 outline-none font-mono"
                    readOnly
                    value={`${appUrl}/api/webhook`}
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(`${appUrl}/api/webhook`)}
                    className="px-4 text-[#4FF07F] hover:bg-[#4FF07F]/10 transition-colors h-full py-4"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Token de Verificação</label>
                <div className="flex items-center gap-4">
                  <input
                    value={webhookToken}
                    onChange={(e) => setWebhookToken(e.target.value)}
                    className={`${inputClass} flex-1 font-mono`}
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-4 rounded-lg bg-[#353534] text-zinc-300 text-xs font-bold hover:text-white transition-all whitespace-nowrap"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerar
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Eventos Monitorados</label>
                <div className="grid grid-cols-3 gap-4">
                  {['messages', 'message_deliveries', 'message_reads'].map((evt) => (
                    <div key={evt} className="flex items-center gap-3 p-4 bg-[#0e0e0e] rounded-lg border border-[#4FF07F]/20">
                      <div className="w-4 h-4 rounded-full bg-[#4FF07F] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#003915] text-[8px] font-black">✓</span>
                      </div>
                      <span className="text-xs font-medium text-white font-mono">{evt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#1C1B1B] rounded-xl p-8 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-xl font-bold font-headline text-white mb-1">Configurações de Envio</h3>
              <p className="text-zinc-500 text-sm">Otimize a performance e segurança das suas campanhas.</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Intervalo entre mensagens (ms)</label>
                <input
                  type="number"
                  min={500}
                  max={5000}
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Máximo de envios por hora</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={maxPerHour}
                  onChange={(e) => setMaxPerHour(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2 flex items-center justify-between p-4 bg-[#0e0e0e] rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#4FF07F]/10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-[#4FF07F]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Reenviar automaticamente em caso de falha</p>
                    <p className="text-xs text-zinc-500">Tentativas automáticas se a entrega falhar.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoRetry((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${autoRetry ? 'bg-[#4FF07F]' : 'bg-zinc-700'}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoRetry ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>

      <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] p-8 bg-[#131313]/90 backdrop-blur-xl border-t border-zinc-800/50 z-30">
        <div className="max-w-4xl mx-auto">
          <button
            type="submit"
            form="settings-form"
            disabled={saving}
            className="w-full py-4 rounded-xl metric-gradient text-[#003915] font-bold text-lg shadow-xl shadow-[#4FF07F]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <Save className="w-5 h-5" />
            Salvar todas as configurações
          </button>
        </div>
      </div>
    </div>
  )
}
