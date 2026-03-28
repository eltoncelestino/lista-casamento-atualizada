"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

type Gift = {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  product_url: string | null
  selected: boolean
  selected_by: string | null
}

export default function PresentesPage() {
  const [guestName, setGuestName] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (confirmed) fetchGifts()
  }, [confirmed])

  const fetchGifts = async () => {
    try {
      const res = await fetch("/api/gifts")
      if (res.ok) {
        const data = await res.json()
        setGifts(data)
      }
    } catch (error) {
      console.error("Erro ao buscar presentes:", error)
    }
  }

  const fireConfetti = () => {
    const duration = 3 * 1000
    const end = Date.now() + duration

    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval)

      confetti({
        particleCount: 40,
        spread: 80,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      })
    }, 250)
  }

  const handleReserve = async (gift: Gift) => {
    if (!guestName) return

    setLoading(true)

    try {
      const res = await fetch("/api/gifts/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gift.id, guestName }),
      })

      if (res.ok) {
        setSelectedGift(gift)
        fireConfetti()
        fetchGifts()
      } else {
        const error = await res.json()
        alert(error.error || "Não foi possível reservar este presente")
      }
    } catch (error) {
      console.error("Erro ao reservar:", error)
      alert("Erro ao reservar presente")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-6 py-20 text-[#4A443F]">

      {/* ETAPA 1 */}
      {!confirmed && (
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif text-[#C65D3B] mb-6">
            Lista de Presentes
          </h1>

          <p className="mb-6 text-stone-500">
            Digite seu nome para acessar a lista
          </p>

          <input
            type="text"
            placeholder="Seu nome"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-4 rounded-xl border border-stone-300 mb-6"
          />

          <button
            disabled={!guestName}
            onClick={() => setConfirmed(true)}
            className="bg-[#C65D3B] text-white px-8 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            Ver Lista de Presentes
          </button>
        </div>
      )}

      {/* ETAPA 2 */}
      {confirmed && !selectedGift && (
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-serif text-center mb-12 text-[#C65D3B]">
            Escolha um presente especial 💛
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {gifts.map((gift) => {
              const isReserved = gift.selected

              return (
                <motion.div
                  key={gift.id}
                  whileHover={!isReserved ? { y: -8 } : {}}
                  className={`rounded-[30px] shadow-lg overflow-hidden transition
                  ${isReserved ? "bg-gray-100 opacity-70" : "bg-white"}`}
                >
                  {gift.image_url && (
                    <img
                      src={gift.image_url}
                      alt={gift.name}
                      className={`h-60 w-full object-contain bg-white p-4
                      ${isReserved ? "grayscale" : ""}`}
                    />
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#C65D3B]">
                      {gift.name}
                    </h3>

                    {gift.description && (
                      <p className="text-sm text-stone-500 mb-4">
                        {gift.description}
                      </p>
                    )}

                    {gift.price && (
                      <p className="font-bold mb-4">
                        {Number(gift.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    )}

                    {isReserved ? (
                      <div className="text-center mt-4">
                        <p className="text-sm font-medium text-stone-600">
                          🎁 Reservado por {gift.selected_by}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">

                        {gift.product_url && (
                          <a
                            href={gift.product_url}
                            target="_blank"
                            className="text-sm underline text-stone-500"
                          >
                            Ver no site da loja
                          </a>
                        )}

                        <button
                          onClick={() => handleReserve(gift)}
                          disabled={loading}
                          className="bg-[#C65D3B] text-white py-2 rounded-full hover:opacity-90 transition"
                        >
                          Escolher este presente
                        </button>

                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ETAPA 3 - AGRADECIMENTO */}
      <AnimatePresence>
        {selectedGift && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mt-32 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl font-serif text-[#C65D3B] mb-6">
              🎉 Obrigado, {guestName}!
            </h2>

            <p className="text-lg mb-4">
              Você escolheu o presente:
            </p>

            <p className="text-2xl font-semibold text-[#C65D3B] mb-6">
              {selectedGift.name}
            </p>

            <p className="italic text-stone-500 mb-10">
              Ficamos imensamente felizes pelo seu carinho 💛
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4">

              {/* BOTÃO VOLTAR */}
              <button
                onClick={() => setSelectedGift(null)}
                className="bg-white border border-[#C65D3B] text-[#C65D3B] px-6 py-3 rounded-full hover:bg-[#C65D3B] hover:text-white transition"
              >
                Voltar para lista
              </button>

              {/* BOTÃO IR PARA LOJA */}
              {selectedGift.product_url && (
                <a
                  href={selectedGift.product_url}
                  target="_blank"
                  className="bg-[#C65D3B] text-white px-6 py-3 rounded-full hover:opacity-90 transition"
                >
                  Ir para o site da loja
                </a>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
