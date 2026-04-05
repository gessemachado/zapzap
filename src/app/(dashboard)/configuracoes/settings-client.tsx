'use client'

import { useState } from 'react'
import type { AppSettings } from '@/types'

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Configurações
        </h1>
        <p className="text-sm text-[#bbcbb9] mt-0.5">Configure sua integração com a Meta WhatsApp Business API</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[#93000a]/30 text-[#ffb4ab] text-sm">{error}</div>
      )}
      {saved && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[#25D366]/20 text-[#4FF07F] text-sm flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Configurações salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Meta API Credentials */}
        <div className="bg-[#1c1b1b] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 opacity-80">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h2 className="text-white font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Credenciais Meta API
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#bbcbb9] mb-1.5">Access Token</label>
              <div className="relative">
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  type={showToken ? 'text' : 'password'}
                  placeholder="EAAxxxxxxxx..."
                  className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 pr-12 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3c4a3d] hover:text-[#bbcbb9] transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    {showToken ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#bbcbb9] mb-1.5">Phone Number ID</label>
                <input
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  placeholder="123456789012345"
                  className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d] font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-[#bbcbb9] mb-1.5">WABA ID</label>
                <input
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  placeholder="123456789012345"
                  className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#bbcbb9] mb-1.5">Versão da API</label>
              <select
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366]"
              >
                <option>v22.0</option>
                <option>v21.0</option>
                <option>v20.0</option>
                <option>v19.0</option>
                <option>v18.0</option>
              </select>
            </div>
          </div>
        </div>

        {/* Webhook */}
        <div className="bg-[#1c1b1b] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Webhook
          </h2>
          <p className="text-xs text-[#bbcbb9] mb-4">Configure no painel Meta para receber status de entrega e leitura</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#bbcbb9] mb-1.5">URL do Webhook</label>
              <div className="flex items-center bg-[#0e0e0e] rounded-lg px-4 py-3 gap-2">
                <span className="text-[#4FF07F] text-sm font-mono flex-1 truncate">
                  {appUrl}/api/webhook
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`${appUrl}/api/webhook`)}
                  className="text-[#3c4a3d] hover:text-[#bbcbb9] transition-colors flex-shrink-0"
                  title="Copiar"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#bbcbb9] mb-1.5">Token de verificação</label>
              <input
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                placeholder="zapzap_wh_..."
                className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Send settings */}
        <div className="bg-[#1c1b1b] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Configurações de envio
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#bbcbb9] mb-1.5">Intervalo entre envios (ms)</label>
                <input
                  type="number"
                  min={500}
                  max={5000}
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}
                  className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366]"
                />
                <p className="text-xs text-[#3c4a3d] mt-1">Mínimo recomendado: 1000ms</p>
              </div>
              <div>
                <label className="block text-sm text-[#bbcbb9] mb-1.5">Máximo por hora</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={maxPerHour}
                  onChange={(e) => setMaxPerHour(Number(e.target.value))}
                  className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-sm text-[#bbcbb9]">Retentar automaticamente falhas</span>
                <p className="text-xs text-[#3c4a3d]">Tenta reenviar mensagens com falha</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoRetry((v) => !v)}
                className={`w-11 h-6 rounded-full transition-colors relative ${autoRetry ? 'bg-[#25D366]' : 'bg-[#353534]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoRetry ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-lg text-sm font-semibold text-[#003915] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  )
}
