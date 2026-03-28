"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/admin")
      } else {
        setError(data.error || "Email ou senha inválidos.")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-stone-100">
        <h1 className="text-3xl font-extrabold text-[#8B4513] mb-2 text-center">
          Login Administrativo
        </h1>
        <p className="text-stone-500 text-center mb-8 text-sm">
          Insira suas credenciais para acessar o painel.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-stone-700 ml-1">Email</label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-4 border-2 border-stone-200 rounded-xl focus:border-terracota focus:ring-2 focus:ring-terracota/20 outline-none transition text-stone-800 placeholder:text-stone-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-stone-700 ml-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-4 border-2 border-stone-200 rounded-xl focus:border-terracota focus:ring-2 focus:ring-terracota/20 outline-none transition text-stone-800 placeholder:text-stone-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 py-2 px-4 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#C05228] text-white py-4 rounded-xl font-bold hover:bg-[#A34320] active:scale-[0.98] transition-all shadow-lg shadow-terracota/20 disabled:opacity-70 mt-2"
          >
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </main>
  )
}
