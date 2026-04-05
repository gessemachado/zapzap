'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  History,
  Settings,
  LogOut,
  MessageCircle,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/contatos', label: 'Contatos', icon: Users },
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { href: '/historico', label: 'Histórico de Envios', icon: History },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-[#1C1B1B] flex flex-col fixed left-0 top-0 z-50">
      <div className="px-6 mb-10 pt-6 flex items-center gap-3">
        <div className="w-10 h-10 metric-gradient rounded-lg flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-[#003915]" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#4FF07F] tracking-tighter font-headline">ZapZap</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Marketing Pro</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                isActive
                  ? 'text-white border-l-4 border-[#4FF07F] bg-[#353534] font-semibold'
                  : 'text-zinc-500 hover:text-white hover:bg-[#201F1F] border-l-4 border-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#4FF07F]' : ''}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pb-6">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-6 py-3 w-full text-sm text-red-400/80 hover:text-red-400 hover:bg-red-950/20 border-l-4 border-transparent transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
