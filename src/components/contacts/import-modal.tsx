'use client'

import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import type { ContactGroup } from '@/types'

type Props = {
  groups: ContactGroup[]
  onClose: () => void
  onImported: () => void
}

type Row = Record<string, string>

export default function ImportModal({ groups, onClose, onImported }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [rows, setRows] = useState<Row[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [nameCol, setNameCol] = useState('')
  const [phoneCol, setPhoneCol] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json<Row>(ws, { raw: false, defval: '' })
        if (data.length === 0) {
          setError('Planilha vazia ou sem dados válidos.')
          return
        }
        setRows(data)
        setColumns(Object.keys(data[0]))
        setStep(2)
      } catch {
        setError('Erro ao ler o arquivo. Certifique-se que é um .xlsx válido.')
      }
    }
    reader.readAsBinaryString(file)
  }

  function handleStep2() {
    if (!nameCol || !phoneCol) {
      setError('Selecione as colunas de Nome e Telefone.')
      return
    }
    setError('')
    setStep(3)
  }

  async function handleImport() {
    setLoading(true)
    setError('')

    const contacts = rows
      .map((r) => ({ name: String(r[nameCol] ?? '').trim(), phone: String(r[phoneCol] ?? '').trim() }))
      .filter((c) => c.name && c.phone)

    const res = await fetch('/api/contacts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts, group_ids: selectedGroups }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro na importação.')
      return
    }

    const data = await res.json()
    setImportedCount(data.imported)
    onImported()
  }

  function toggleGroup(id: string) {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const preview = rows.slice(0, 5)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-[#1c1b1b] rounded-xl w-full max-w-lg p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Importar contatos
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {([1, 2, 3] as const).map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium ${
                      step >= s ? 'bg-[#25D366] text-[#003915]' : 'bg-[#353534] text-[#bbcbb9]'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && <div className={`w-6 h-px ${step > s ? 'bg-[#25D366]' : 'bg-[#353534]'}`} />}
                </div>
              ))}
              <span className="text-xs text-[#bbcbb9] ml-1">
                {step === 1 ? 'Upload' : step === 2 ? 'Mapeamento' : 'Confirmação'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#bbcbb9] hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-[#93000a]/30 text-[#ffb4ab] text-sm">
            {error}
          </div>
        )}

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div>
            <p className="text-sm text-[#bbcbb9] mb-4">
              Selecione um arquivo <strong className="text-white">.xlsx</strong> com os contatos a importar.
            </p>
            <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-[#3c4a3d] hover:border-[#25D366] transition-colors cursor-pointer bg-[#0e0e0e]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-[#3c4a3d] mb-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-sm text-[#bbcbb9]">Clique para selecionar o arquivo</span>
              <span className="text-xs text-[#3c4a3d] mt-1">Apenas .xlsx</span>
              <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
            </label>
          </div>
        )}

        {/* Step 2 — Column mapping */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#bbcbb9]">
              Encontramos <strong className="text-white">{rows.length} linhas</strong>. Mapeie as colunas:
            </p>

            <div>
              <label className="block text-sm text-[#bbcbb9] mb-1.5">Coluna de Nome</label>
              <select
                value={nameCol}
                onChange={(e) => setNameCol(e.target.value)}
                className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366]"
              >
                <option value="">Selecione...</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#bbcbb9] mb-1.5">Coluna de Telefone</label>
              <select
                value={phoneCol}
                onChange={(e) => setPhoneCol(e.target.value)}
                className="w-full bg-[#0e0e0e] text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#25D366]"
              >
                <option value="">Selecione...</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {groups.length > 0 && (
              <div>
                <label className="block text-sm text-[#bbcbb9] mb-2">Adicionar ao grupo (opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((g) => {
                    const selected = selectedGroups.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGroup(g.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? 'border-transparent text-[#131313]'
                            : 'border-[#3c4a3d] text-[#bbcbb9] hover:border-[#25D366]'
                        }`}
                        style={selected ? { backgroundColor: g.color } : {}}
                      >
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-lg text-sm text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleStep2}
                className="flex-1 py-3 rounded-lg text-sm font-semibold text-[#003915]"
                style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Preview & Confirm */}
        {step === 3 && importedCount === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-[#bbcbb9]">
              Prévia dos primeiros contatos a importar:
            </p>
            <div className="rounded-lg overflow-hidden border border-[#3c4a3d]/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0e0e0e] text-[#bbcbb9]">
                    <th className="px-3 py-2 text-left font-medium">Nome</th>
                    <th className="px-3 py-2 text-left font-medium">Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-[#3c4a3d]/20">
                      <td className="px-3 py-2 text-white">{String(row[nameCol] ?? '')}</td>
                      <td className="px-3 py-2 text-[#bbcbb9]">{String(row[phoneCol] ?? '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 5 && (
              <p className="text-xs text-[#3c4a3d] text-center">
                + {rows.length - 5} contatos adicionais
              </p>
            )}
            <p className="text-sm text-[#bbcbb9]">
              Total: <strong className="text-white">{rows.length} contatos</strong>
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-lg text-sm text-[#bbcbb9] border border-[#3c4a3d] hover:border-[#25D366] hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="flex-1 py-3 rounded-lg text-sm font-semibold text-[#003915] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
              >
                {loading ? 'Importando...' : `Importar ${rows.length} contatos`}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 3 && importedCount > 0 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={2} className="w-8 h-8">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">{importedCount} contatos importados!</p>
            <p className="text-sm text-[#bbcbb9] mb-6">Os contatos foram adicionados com sucesso.</p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-lg text-sm font-semibold text-[#003915]"
              style={{ background: 'linear-gradient(135deg, #4FF07F 0%, #25D366 100%)' }}
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
