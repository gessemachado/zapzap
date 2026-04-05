'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Contact, ContactGroup } from '@/types'
import ContactModal from './contact-modal'
import ImportModal from './import-modal'

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

  // Groups management state
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
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Contatos
          </h1>
          <p className="text-sm text-[#bbcbb9] mt-0.5">{contacts.length} contatos encontrados</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGroups(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Grupos
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Importar Excel
          </button>
          <button
            onClick={() => { setEditContact(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#003915]"
            style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo contato
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-[#3c4a3d] absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1c1b1b] text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
          />
        </div>

        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="bg-[#1c1b1b] text-[#bbcbb9] rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#25D366] min-w-[160px]"
        >
          <option value="">Todos os grupos</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1c1b1b] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 text-[#3c4a3d] mb-3">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-[#bbcbb9] text-sm">Nenhum contato encontrado</p>
            <p className="text-[#3c4a3d] text-xs mt-1">Adicione contatos ou importe via Excel</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3c4a3d]/20">
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Nome</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Telefone</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Grupos</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-[#bbcbb9] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-[#3c4a3d]/10 hover:bg-[#201f1f] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#25D366] text-xs font-semibold">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-medium">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#bbcbb9] font-mono text-xs">
                    {contact.phone}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {(contact.groups ?? []).map((g) => (
                        <span
                          key={g.id}
                          className="px-2 py-0.5 rounded-full text-xs font-medium text-[#131313]"
                          style={{ backgroundColor: g.color }}
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contact.active
                        ? 'bg-[#25D366]/15 text-[#4FF07F]'
                        : 'bg-[#353534] text-[#bbcbb9]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${contact.active ? 'bg-[#4FF07F]' : 'bg-[#bbcbb9]'}`} />
                      {contact.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditContact(contact); setShowModal(true) }}
                        className="p-1.5 rounded-lg text-[#bbcbb9] hover:text-white hover:bg-[#353534] transition-colors"
                        title="Editar"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(contact.id)}
                        className="p-1.5 rounded-lg text-[#bbcbb9] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors"
                        title="Excluir"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contact Modal */}
      {showModal && (
        <ContactModal
          contact={editContact}
          groups={groups}
          onClose={() => { setShowModal(false); setEditContact(null) }}
          onSaved={() => { setShowModal(false); setEditContact(null); fetchContacts() }}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          groups={groups}
          onClose={() => setShowImport(false)}
          onImported={() => { fetchContacts() }}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#1c1b1b] rounded-xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-white font-semibold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Excluir contato?</h3>
            <p className="text-sm text-[#bbcbb9] mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[#93000a] hover:bg-[#b91c1c] text-white transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Manager Modal */}
      {showGroups && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#1c1b1b] rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Gerenciar grupos
              </h2>
              <button onClick={() => { setShowGroups(false); setEditGroup(null) }} className="text-[#bbcbb9] hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add / edit form */}
            <div className="bg-[#0e0e0e] rounded-lg p-4 mb-4">
              <p className="text-xs text-[#bbcbb9] mb-3 font-medium">
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
                  className="flex-1 bg-[#1c1b1b] text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#25D366] placeholder:text-[#3c4a3d]"
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#bbcbb9]">Cor:</span>
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
                    className="px-3 py-1.5 rounded-lg text-xs text-[#bbcbb9] border border-[#3c4a3d] hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={handleSaveGroup}
                  disabled={groupLoading || !(editGroup ? editGroup.name : newGroupName)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#003915] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
                >
                  {groupLoading ? '...' : editGroup ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>

            {/* Groups list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-sm text-[#3c4a3d] text-center py-4">Nenhum grupo criado ainda</p>
              ) : (
                groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0e0e0e]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                      <span className="text-sm text-white">{g.name}</span>
                      <span className="text-xs text-[#3c4a3d]">{g.member_count} contatos</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditGroup(g)}
                        className="p-1 rounded text-[#bbcbb9] hover:text-white hover:bg-[#353534] transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(g.id)}
                        className="p-1 rounded text-[#bbcbb9] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
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
