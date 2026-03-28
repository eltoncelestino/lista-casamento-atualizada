"use client"

import Countdown from "./components/Countdown"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] overflow-x-hidden">

      {/* FUNDO DECORATIVO */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#C65D3B]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#A34320]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative px-6 md:px-12 py-24 text-center">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-7xl md:text-9xl font-serif text-[#C65D3B] mb-6">
            Clarice & Elton
          </h1>

          <p className="text-lg md:text-xl max-w-xl mx-auto mb-12 italic text-stone-500">
            "O amor aquece a alma como o pôr do sol ilumina o horizonte."
          </p>

          <Countdown />
        </motion.div>

        {/* DATA */}
        <section className="mt-24">
          <h2 className="text-3xl text-[#C65D3B] font-semibold mb-6">
            Nosso Grande Dia
          </h2>
          <p className="text-lg">09 de Maio de 2026</p>
          <p className="text-lg">às 16:00</p>
        </section>

        {/* LINKS PRINCIPAIS */}
        <section className="mt-32 grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          <Link href="/presentes">
            <div className="bg-white p-12 rounded-[40px] shadow-xl hover:shadow-2xl transition-all cursor-pointer">
              <h3 className="text-2xl font-serif text-[#C65D3B] mb-4">
                Lista de Presentes
              </h3>
              <p className="text-stone-500">
                Escolha um presente especial para nós.
              </p>
            </div>
          </Link>

          <Link href="/pix">
            <div className="bg-[#C65D3B] text-white p-12 rounded-[40px] shadow-xl hover:shadow-2xl transition-all cursor-pointer">
              <h3 className="text-2xl font-serif mb-4">
                Contribuir via PIX
              </h3>
              <p className="opacity-80">
                Prefere contribuir com qualquer valor?
              </p>
            </div>
          </Link>

          <Link href="/confirmar-presenca">
            <div className="bg-white p-12 rounded-[40px] shadow-xl hover:shadow-2xl transition-all cursor-pointer">
              <h3 className="text-2xl font-serif text-[#C65D3B] mb-4">
                Confirmar Presença
              </h3>
              <p className="text-stone-500">
                Confirme sua presença no nosso dia.
              </p>
            </div>
          </Link>

        </section>

        {/* FINAL EMOCIONAL */}
        <footer className="mt-40 text-center opacity-40">
          <p className="font-serif text-3xl text-[#C65D3B] mb-4">
            Clarice & Elton
          </p>
          <p className="text-xs uppercase tracking-[0.5em]">
            Com carinho, nos vemos em breve!
          </p>
        </footer>

      </div>
    </main>
  )
}
