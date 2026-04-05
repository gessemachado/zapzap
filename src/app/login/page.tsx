'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <span
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              ZapZap
            </span>
          </div>
          <p className="text-[#bbcbb9] text-sm">Plataforma de Marketing WhatsApp</p>
        </div>

        {/* Card */}
        <div className="bg-[#1c1b1b] rounded-xl p-8">
          <h1
            className="text-xl font-semibold text-white mb-6"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Entrar na sua conta
          </h1>

          {state?.error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#93000a]/30 text-[#ffb4ab] text-sm">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-[#bbcbb9] mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#bbcbb9] mb-1.5">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-lg text-sm font-semibold text-[#003915] mt-2 cursor-pointer disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
            >
              {pending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
