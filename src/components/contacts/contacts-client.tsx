'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Contact, ContactGroup } from '@/types'
import ContactModal from './contact-modal'
import ImportModal from './import-modal'
import {
  Search,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
} from 'lucide-react'

type Props = {
  initialGroups: ContactGroup[]
}

const GROUP_COLORS = [
  '#25D366', '#4FF07F', '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
]

export default function ContactsClient({ initialGroups }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<ContactGroup[]>(initialGroups)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showGroups, setShowGroups] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0])
  const [editGroup, setEditGroup] = useState<ContactGroup | null>(null)
  const [groupLoading, setGroupLoading] = useState(false)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterGroup) params.set('group', filterGroup)
    const res = await fetch(`/api/contacts?${params}`)
    if (res.ok) setContacts(await res.json())
    setLoading(false)
  }, [search, filterGroup])

  const fetchGroups = useCallback(async () => {
    const res = await fetch('/api/groups')
    if (res.ok) setGroups(await res.json())
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  async function handleDelete(id: string) {
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    fetchContacts()
  }

  async function handleSaveGroup() {
    setGroupLoading(true)
    if (editGroup) {
      await fetch(`/api/groups/${editGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editGroup.name, color: editGroup.color }),
      })
    } else {
      await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, color: newGroupColor }),
      })
    }
    setGroupLoading(false)
    setNewGroupName('')
    setNewGroupColor(GROUP_COLORS[0])
    setEditGroup(null)
    fetchGroups()
  }

  async function handleDeleteGroup(id: string) {
    await fetch(`/api/groups/${id}`, { method: 'DELETE' })
    fetchGroups()
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-20 bg-[#131313]/80 backdrop-blur-md flex justify-between items-center px-8 z-40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h1 className="font-headline font-bold text-2xl text-white">Contatos</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#353534] text-white font-semibold hover:opacity-80 transition-opacity active:scale-95 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#4FF07F]" />
            Importar Excel
          </button>
          <button
            onClick={() => { setEditContact(null); setShowModal(true) }}
            className="metric-gradient flex items-center gap-2 px-6 py-2.5 rounded-lg text-[#003915] font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-[#4FF07F]/10 text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Novo Contato
          </button>
        </div>
      </header>

      <div className="pt-28">
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#4FF07F] transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#201F1F] border-none rounded-lg py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-[#4FF07F]/20 transition-all text-sm outline-none"
              placeholder="Buscar por nome ou número..."
            />
          </div>
          <div className="w-64 relative">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full bg-[#201F1F] border-none rounded-lg py-3.5 pl-4 pr-10 text-white appearance-none focus:ring-2 focus:ring-[#4FF07F]/20 transition-all text-sm outline-none"
            >
              <option value="">Todos os status</option>
              <option value="">Ativo</option>
              <option value="">Inativo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowGroups(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#201F1F] text-zinc-400 hover:text-white hover:bg-[#2A2A2A] transition-colors text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            Grupos
          </button>
        </div>

        <div className="bg-[#201F1F] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-[#4FF07F] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-zinc-700 mb-3" strokeWidth={1} />
                <p className="text-zinc-400 text-sm">Nenhum contato encontrado</p>
                <p className="text-zinc-600 text-xs mt-1">Adicione contatos ou importe via Excel</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1C1B1B] border-b border-[#3c4a3d]/10">
                    <th className="py-4 px-6 w-12">
                      <input className="rounded border-zinc-700 bg-[#353534] text-[#4FF07F] focus:ring-[#4FF07F]/20" type="checkbox" />
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Nome</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Número WhatsApp</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Data de Cadastro</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3c4a3d]/5">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-[#353534] transition-colors group">
                      <td className="py-4 px-6">
                        <input className="rounded border-zinc-700 bg-[#1C1B1B] text-[#4FF07F] focus:ring-[#4FF07F]/20" type="checkbox" />
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">{contact.name}</td>
                      <td className="py-4 px-6 text-zinc-400 font-mono text-sm">{contact.phone}</td>
                      <td className="py-4 px-6">
                        {contact.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0d5526] text-[#84c88d]">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#353534] text-zinc-400">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-zinc-500 text-sm">
                        {new Date(contact.created_at ?? '').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          onClick={() => { setEditContact(contact); setShowModal(true) }}
                          className="p-2 text-zinc-500 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(contact.id)}
                          className="p-2 text-zinc-500 hover:text-[#ffb4ab] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-[#1C1B1B] px-8 py-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Mostrando <span className="text-white font-bold">{contacts.length}</span> contatos
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[#353534] text-zinc-400 hover:text-white transition-all disabled:opacity-30" disabled>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg bg-[#4FF07F] text-[#003915] font-bold text-sm">1</button>
              </div>
              <button className="p-2 rounded-lg hover:bg-[#353534] text-zinc-400 hover:text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ContactModal
          contact={editContact}
          groups={groups}
          onClose={() => { setShowModal(false); setEditContact(null) }}
          onSaved={() => { setShowModal(false); setEditContact(null); fetchContacts() }}
        />
      )}

      {showImport && (
        <ImportModal
          groups={groups}
          onClose={() => setShowImport(false)}
          onImported={() => { fetchContacts() }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#1C1B1B] rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-2 font-headline">Excluir contato?</h3>
            <p className="text-sm text-zinc-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm text-zinc-400 border border-[#3c4a3d] hover:border-[#4FF07F] hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[#93000a] hover:bg-red-800 text-white transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showGroups && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#1C1B1B] rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg font-headline">Gerenciar grupos</h2>
              <button onClick={() => { setShowGroups(false); setEditGroup(null) }} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0e0e0e] rounded-lg p-4 mb-4">
              <p className="text-xs text-zinc-400 mb-3 font-medium">
                {editGroup ? 'Editando grupo' : 'Novo grupo'}
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  value={editGroup ? editGroup.name : newGroupName}
                  onChange={(e) =>
                    editGroup
                      ? setEditGroup({ ...editGroup, name: e.target.value })
                      : setNewGroupName(e.target.value)
                  }
                  placeholder="Nome do grupo"
                  className="flex-1 bg-[#1C1B1B] text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#4FF07F] placeholder:text-zinc-600"
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-zinc-400">Cor:</span>
                <div className="flex gap-1.5">
                  {GROUP_COLORS.map((c) => {
                    const current = editGroup ? editGroup.color : newGroupColor
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          editGroup
                            ? setEditGroup({ ...editGroup, color: c })
                            : setNewGroupColor(c)
                        }
                        className={`w-5 h-5 rounded-full transition-transform ${current === c ? 'scale-125 ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                {editGroup && (
                  <button
                    onClick={() => setEditGroup(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 border border-[#3c4a3d] hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={handleSaveGroup}
                  disabled={groupLoading || !(editGroup ? editGroup.name : newGroupName)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#003915] disabled:opacity-50 metric-gradient"
                >
                  {groupLoading ? '...' : editGroup ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-sm text-zinc-600 text-center py-4">Nenhum grupo criado ainda</p>
              ) : (
                groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0e0e0e]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                      <span className="text-sm text-white">{g.name}</span>
                      <span className="text-xs text-zinc-600">{g.member_count} contatos</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditGroup(g)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#353534] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(g.id)}
                        className="p-1 rounded text-zinc-400 hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
