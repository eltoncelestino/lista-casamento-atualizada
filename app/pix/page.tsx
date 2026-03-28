"use client"

import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const pixCode = `00020126490014br.gov.bcb.pix0127mariaclarice91347@gmail.com5204000053039865802BR5925Maria Clarice Camara Mour6009Sao Paulo62290525REC699F6F02A0F46770031914630446D0`
const pixKey = "mariaclarice91347@gmail.com"

export default function PixPage() {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const handleUpload = async () => {
    if (!name || !amount || !file) {
      setStatus("error")
      alert("Preencha todos os campos.")
      return
    }

    if (Number(amount) < 50) {
      alert("O valor mínimo é R$ 50.")
      return
    }

    setSending(true)

    try {
      // Em produção, você precisará de um bucket de storage (S3, R2, etc.)
      // Aqui vamos simular o upload
      const fileName = `${Date.now()}-${file.name}`

      // Para um storage real, use:
      // 1. AWS S3 + pre-signed URLs
      // 2. Cloudflare R2
      // 3. Uploadcare
      // 4. Ou um endpoint próprio que salva no filesystem

      // Por enquanto, vamos salvar apenas os metadados
      // e assumir que o comprovante será enviado por outro meio

      const receipt_url = `comprovante/${fileName}` // URL simulada

      const res = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          receipt_url,
        }),
      })

      if (res.ok) {
        setStatus("success")
        setName("")
        setAmount("")
        setFile(null)
      } else {
        setStatus("error")
        alert("Erro ao enviar comprovante")
      }
    } catch (err: any) {
      alert("Erro: " + err.message)
      setStatus("error")
    }

    setSending(false)
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 sm:px-6 py-12 sm:py-20 text-[#4A443F]">

      <div className="max-w-5xl mx-auto bg-[#C65D3B] text-white rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 shadow-xl">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-center mb-8 sm:mb-10">
          Contribuição via PIX 💛
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

          {/* QR CODE */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-white p-4 sm:p-6 rounded-2xl">
              <QRCodeSVG value={pixCode} size={180} />
            </div>
            <p className="mt-4 text-sm">Escaneie o QR Code</p>
          </div>

          {/* FORMULÁRIO */}
          <div className="w-full">

            <p className="text-sm opacity-80 mb-2">Chave PIX</p>

            <div className="bg-white/20 p-3 rounded-xl mb-6 break-all text-sm">
              {pixKey}
            </div>

            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl mb-4 text-black"
            />

            <input
              type="number"
              placeholder="Valor enviado (mín. R$ 50)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl mb-4 text-black"
            />

            <label className="block mb-4">
              <span className="block mb-2 text-sm">Enviar comprovante</span>

              <div className="bg-white text-[#C65D3B] px-6 py-3 rounded-full text-center cursor-pointer hover:scale-105 transition">
                Escolher arquivo
              </div>

              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="hidden"
              />
            </label>

            {file && (
              <p className="text-sm mb-4 break-all">
                📎 {file.name}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={sending}
              className="bg-white text-[#C65D3B] px-6 py-3 rounded-full w-full hover:scale-105 transition"
            >
              {sending ? "Enviando..." : "Enviar comprovante"}
            </button>

          </div>
        </div>

        <AnimatePresence>
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 sm:mt-12 bg-white text-[#C65D3B] p-4 sm:p-6 rounded-2xl text-center text-sm sm:text-base"
            >
              💛 Recebemos seu comprovante com carinho!
              Obrigado por fazer parte desse momento!
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 sm:mt-12 bg-red-500 text-white p-4 sm:p-6 rounded-2xl text-center text-sm sm:text-base"
            >
              ⚠️ Ops! Algo deu errado.
              Verifique os dados e tente novamente.
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}
