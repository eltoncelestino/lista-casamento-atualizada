"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts"

const COLORS = ["#C65D3B", "#E8A87C", "#41B3A3", "#2A9D8F", "#264653"]

type Gift = {
  id: string
  name: string
  description: string | null
  price: number | null
  product_url: string | null
  image_url: string | null
  selected: boolean
  selected_by: string | null
}

type Confirmacao = {
  id: string
  nome: string
  email: string | null
  mensagem: string | null
  comparecera: boolean
  created_at: string
}

type PixContribution = {
  id: string
  name: string
  amount: number
  receipt_url: string | null
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [tab, setTab] = useState("dashboard")
  const [gifts, setGifts] = useState<Gift[]>([])
  const [confirmacoes, setConfirmacoes] = useState<Confirmacao[]>([])
  const [pix, setPix] = useState<PixContribution[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState<any>({
    id: null,
    name: "",
    description: "",
    price: "",
    product_url: "",
    image_url: "",
    image: null
  })
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ================================
  // 🔐 PROTEÇÃO DE ROTA
  // ================================

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          router.push("/admin/login")
          return
        }
        setCheckingAuth(false)
        fetchData()
      } catch (error) {
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
        Verificando acesso...
      </div>
    )
  }

  // ================================
  // FETCH
  // ================================

  async function fetchData() {
    setLoading(true)

    try {
      const [gRes, cRes, pRes] = await Promise.all([
        fetch("/api/gifts"),
        fetch("/api/confirmacoes"),
        fetch("/api/pix"),
      ])

      if (gRes.ok) setGifts(await gRes.json())
      if (cRes.ok) setConfirmacoes(await cRes.json())
      if (pRes.ok) setPix(await pRes.json())
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    }

    setLoading(false)
  }

  // ================================
  // CRUD PRESENTES
  // ================================

  async function salvarPresente() {
    if (!form.name) {
      setFormMsg({ type: "error", text: "O nome do presente é obrigatório." })
      setTimeout(() => setFormMsg(null), 4000)
      return
    }
    const priceNum = parseFloat(form.price)
    if (!form.price || isNaN(priceNum) || priceNum <= 0) {
      setFormMsg({ type: "error", text: "Informe um valor em reais válido (ex: 199.90)." })
      setTimeout(() => setFormMsg(null), 4000)
      return
    }

    let imageUrl = form.image_url || null

    // Upload de imagem seria feito aqui (S3, R2, etc.)
    // Por enquanto, mantemos a URL existente

    try {
      const res = await fetch("/api/gifts", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          product_url: form.product_url,
          image_url: imageUrl,
        }),
      })

      if (res.ok) {
        setForm({ id: null, name: "", description: "", price: "", product_url: "", image_url: "", image: null })
        setFormMsg({ type: "success", text: form.id ? "Presente atualizado com sucesso!" : "Presente cadastrado com sucesso!" })
        fetchData()
      } else {
        setFormMsg({ type: "error", text: "Erro ao salvar presente. Tente novamente." })
      }
    } catch (error) {
      setFormMsg({ type: "error", text: "Erro de conexão. Verifique e tente novamente." })
    }
    setTimeout(() => setFormMsg(null), 4000)
  }

  async function removerPresente(id: string) {
    if (!confirm("Tem certeza que deseja remover este presente?")) return

    try {
      await fetch(`/api/gifts?id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      alert("Erro ao remover presente")
    }
  }

  async function alternarPresenca(id: string, atual: boolean) {
    try {
      await fetch("/api/confirmacoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, comparecera: !atual }),
      })
      fetchData()
    } catch (error) {
      alert("Erro ao atualizar confirmação")
    }
  }

  // ================================
  // LOGOUT
  // ================================

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
  }

  // ================================
  // EXCEL
  // ================================

  function exportarExcel() {
    const wb = XLSX.utils.book_new()

    // ── ABA 1: RESUMO ──────────────────────────────────────────
    const resumo = [
      { Informacao: 'Total de Presentes',       Valor: gifts.length },
      { Informacao: 'Presentes Reservados',     Valor: gifts.filter(g => g.selected).length },
      { Informacao: 'Presentes Disponíveis',    Valor: gifts.filter(g => !g.selected).length },
      { Informacao: 'Total de Confirmações',    Valor: confirmacoes.length },
      { Informacao: 'Confirmados (vão)',         Valor: confirmados },
      { Informacao: 'Não vão',                  Valor: ausentes },
      { Informacao: 'Total de Contribuições PIX', Valor: pix.length },
      { Informacao: 'Total Arrecadado (R$)',    Valor: totalPix.toFixed(2) },
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo), 'Resumo')

    // ── ABA 2: PRESENTES ───────────────────────────────────────
    const giftsFormatados = gifts.map(g => ({
      Nome:         g.name,
      Descricao:    g.description || '',
      'Preco (R$)': g.price ? Number(g.price).toFixed(2) : '',
      'Link Produto': g.product_url || '',
      'URL Imagem':  g.image_url || '',
      Reservado:    g.selected ? 'Sim' : 'Não',
      'Reservado Por': g.selected_by || '',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(giftsFormatados), 'Presentes')

    // ── ABA 3: CONFIRMAÇÕES ────────────────────────────────────
    const confirmacoesFormatadas = confirmacoes.map(c => ({
      Nome:       c.nome,
      Email:      c.email || '',
      Mensagem:   c.mensagem || '',
      Presenca:   c.comparecera ? 'Confirmado' : 'Não vai',
      Data:       new Date(c.created_at).toLocaleDateString('pt-BR'),
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(confirmacoesFormatadas), 'Confirmacoes')

    // ── ABA 4: PIX ─────────────────────────────────────────────
    const pixFormatados = pix.map(p => ({
      Nome:           p.name,
      'Valor (R$)':   Number(p.amount).toFixed(2),
      Data:           new Date(p.created_at).toLocaleDateString('pt-BR'),
      'Comprovante':  p.receipt_url ? 'Enviado' : 'Não enviado',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pixFormatados), 'PIX')

    XLSX.writeFile(wb, `relatorio-casamento-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`)
  }

  // ================================
  // MÉTRICAS
  // ================================

  const totalPix = pix.reduce((acc, p) => acc + Number(p.amount || 0), 0)
  const confirmados = confirmacoes.filter(c => c.comparecera).length
  const ausentes = confirmacoes.filter(c => !c.comparecera).length

  const pixPorPessoa = pix.map(p => ({
    name: p.name || "Anônimo",
    value: parseFloat(String(p.amount || 0))
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
        Carregando dados...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex flex-col md:flex-row">

      {/* SIDEBAR */}
      <aside className="md:w-64 bg-white shadow-xl p-6">
        <h1 className="text-2xl font-bold text-[#C65D3B] mb-8">
          Admin 💍
        </h1>

        {["dashboard", "presentes", "confirmacoes", "pix"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`w-full text-left px-4 py-3 rounded-xl mb-3 transition-all
              ${tab === t
                ? "bg-[#C65D3B] text-white shadow-md"
                : "hover:bg-gray-100 text-gray-600"}`}
          >
            {t.toUpperCase()}
          </button>
        ))}

        <button
          onClick={exportarExcel}
          className="mt-6 bg-green-600 text-white w-full py-3 rounded-xl shadow hover:scale-105 transition"
        >
          Exportar Excel
        </button>

        <button
          onClick={handleLogout}
          className="mt-3 bg-gray-500 text-white w-full py-3 rounded-xl shadow hover:scale-105 transition"
        >
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6 md:p-10 space-y-10">

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard title="Total PIX" value={totalPix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
              <StatCard title="Confirmados" value={confirmados} />
              <StatCard title="Ausentes" value={ausentes} />
            </div>

            {pix.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="font-semibold mb-4">PIX por Pessoa</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={pixPorPessoa} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} tick={{ fontSize: 12 }} width={90} />
                    <Tooltip formatter={(v: any) => [Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Valor"]} />
                    <Bar dataKey="value" fill="#C65D3B" radius={[6, 6, 0, 0]}>
                      {pixPorPessoa.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* PRESENTES */}
        {tab === "presentes" && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow grid md:grid-cols-2 gap-4">
              <input placeholder="Nome"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="p-3 border rounded-xl"
              />
              <input
                placeholder="Valor (ex: 199.90)"
                value={form.price}
                onChange={e => {
                  const v = e.target.value
                  if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) setForm({ ...form, price: v })
                }}
                inputMode="decimal"
                className="p-3 border rounded-xl"
              />
              <input placeholder="Link do produto"
                value={form.product_url}
                onChange={e => setForm({ ...form, product_url: e.target.value })}
                className="p-3 border rounded-xl md:col-span-2"
              />
              <textarea placeholder="Descrição"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="p-3 border rounded-xl md:col-span-2"
              />
              <input placeholder="URL da imagem"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                className="p-3 border rounded-xl md:col-span-2"
              />
              {formMsg && (
                <div className={`md:col-span-2 px-4 py-3 rounded-xl text-sm font-medium ${
                  formMsg.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {formMsg.type === "success" ? "✅ " : "❌ "}{formMsg.text}
                </div>
              )}
              <button
                onClick={salvarPresente}
                className="bg-[#C65D3B] text-white py-3 rounded-xl md:col-span-2 hover:opacity-90 transition"
              >
                {form.id ? "Atualizar Presente" : "Cadastrar Presente"}
              </button>
              {form.id && (
                <button
                  onClick={() => setForm({ id: null, name: "", description: "", price: "", product_url: "", image_url: "", image: null })}
                  className="bg-gray-200 text-gray-700 py-3 rounded-xl md:col-span-2 hover:bg-gray-300 transition"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map(g => (
                <div key={g.id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col">
                  {g.image_url && (
                    <img src={g.image_url} alt={g.name}
                      className="h-40 w-full object-contain rounded-xl mb-4 bg-gray-50 p-2" />
                  )}
                  <h3 className="font-semibold text-[#C65D3B]">{g.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{g.description}</p>
                  {g.price && (
                    <p className="font-bold mt-2">{Number(g.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  )}
                  {g.selected && (
                    <p className="text-xs text-green-600 mt-1">🎁 Reservado por {g.selected_by}</p>
                  )}
                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      onClick={() => { setForm({ ...g, image: null }); setTab("presentes") }}
                      className="flex-1 bg-[#E8A87C] text-white py-2 rounded-lg hover:opacity-90 transition">
                      Editar
                    </button>
                    <button
                      onClick={() => removerPresente(g.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:opacity-90 transition">
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CONFIRMAÇÕES */}
        {tab === "confirmacoes" && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <StatCard title="Total" value={confirmacoes.length} />
              <StatCard title="Confirmados" value={confirmados} />
              <StatCard title="Não vão" value={ausentes} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {confirmacoes.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-2xl shadow">
                  <h3 className="font-semibold text-lg">{c.nome}</h3>
                  {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
                  {c.mensagem && <p className="text-sm text-gray-400 italic mt-1">"{c.mensagem}"</p>}
                  <p className={`mt-2 font-medium ${c.comparecera ? "text-green-600" : "text-red-500"}`}>
                    {c.comparecera ? "✅ Confirmado" : "❌ Não vai"}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => alternarPresenca(c.id, c.comparecera)}
                      className="bg-[#C65D3B] text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
                      Alternar Presença
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PIX */}
        {tab === "pix" && (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <StatCard title="Total Arrecadado" value={totalPix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
              <StatCard title="Contribuições" value={pix.length} />
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#C65D3B] text-white">
                  <tr>
                    <th className="p-4 text-left">Nome</th>
                    <th className="p-4 text-left">Valor</th>
                    <th className="p-4 text-left">Data</th>
                    <th className="p-4 text-left">Comprovante</th>
                  </tr>
                </thead>
                <tbody>
                  {pix.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4 text-green-700 font-bold">{Number(p.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-4">
                        {p.receipt_url ? (
                          p.receipt_url.startsWith('data:image') ? (
                            <a href={p.receipt_url} target="_blank" rel="noreferrer"
                              className="text-[#C65D3B] underline hover:opacity-80">
                              Ver imagem
                            </a>
                          ) : p.receipt_url.startsWith('data:application/pdf') ? (
                            <a href={p.receipt_url} target="_blank" rel="noreferrer"
                              className="text-[#C65D3B] underline hover:opacity-80">
                              Ver PDF
                            </a>
                          ) : (
                            <a href={p.receipt_url} target="_blank" rel="noreferrer"
                              className="text-[#C65D3B] underline hover:opacity-80">
                              Ver comprovante
                            </a>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pix.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-xl mt-6">
                <h2 className="font-semibold mb-6">Distribuição por Pessoa</h2>
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={pixPorPessoa}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={120}
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {pixPorPessoa.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Valor"]} />
                    <Legend iconType="circle" formatter={(value) => <span style={{ fontSize: 13 }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-[1.02] transition">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-[#C65D3B] mt-2">
        {value}
      </h2>
    </div>
  )
}
