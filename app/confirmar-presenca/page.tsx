"use client"

import { useState } from "react"

export default function ConfirmarPresencaPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [presenca, setPresenca] = useState("true")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(false)

    try {
      const res = await fetch("/api/confirmacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          mensagem,
          comparecera: presenca === "true",
        }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        setErrorMsg(true)
        setTimeout(() => setErrorMsg(false), 5000)
      }
    } catch (error) {
      setErrorMsg(true)
      setTimeout(() => setErrorMsg(false), 5000)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6">

      {/* NOTIFICAÇÃO DE ERRO ESTILIZADA */}
      {errorMsg && (
        <div className="fixed top-10 right-10 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-lg animate-in fade-in slide-in-from-top-5 z-[100]">
          <div className="flex items-center">
            <span className="text-red-500 mr-3">⚠️</span>
            <p className="text-red-800 font-medium">Ops! Não conseguimos salvar sua presença. Tente novamente.</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-stone-100 text-center">
          {!sent ? (
            <>
              <h1 className="text-3xl font-serif text-[#C65D3B] mb-2">Confirmar Presença</h1>
              <p className="text-stone-500 mb-8 italic text-sm">Sua presença é essencial para nós!</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-stone-100 bg-stone-50 focus:ring-2 focus:ring-[#C65D3B]/20 outline-none transition-all"
                />

                <input
                  type="email"
                  placeholder="Seu e-mail (opcional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-stone-100 bg-stone-50 focus:ring-2 focus:ring-[#C65D3B]/20 outline-none transition-all"
                />

                <textarea
                  placeholder="Deixe uma mensagem (opcional)"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-stone-100 bg-stone-50 focus:ring-2 focus:ring-[#C65D3B]/20 outline-none transition-all resize-none"
                  rows={3}
                />

                <select
                  value={presenca}
                  onChange={(e) => setPresenca(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-stone-100 bg-stone-50 outline-none"
                >
                  <option value="true">Sim, eu irei!</option>
                  <option value="false">Não poderei ir</option>
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C65D3B] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#A34320] transition-all disabled:opacity-50"
                >
                  {loading ? "Processando..." : "Confirmar Agora"}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-in zoom-in duration-500 py-6">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-serif text-green-600 mb-2">Tudo certo!</h2>
              <p className="text-stone-500">Sua confirmação foi enviada com sucesso. Obrigado! 💛</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
