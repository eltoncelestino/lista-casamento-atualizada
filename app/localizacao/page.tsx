"use client"

import { motion } from "framer-motion"

export default function LocalizacaoPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] px-6 py-20 text-[#4A443F]">
      <div className="max-w-6xl mx-auto">

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-serif text-[#C65D3B] mb-6">
            Local da Celebração
          </h1>
          <p className="italic text-stone-500">
            Av. Pratiús - Caponga, s/n - Pratius, Pindoretama - CE
          </p>
        </motion.div>

        {/* Infos + mapa */}
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-serif text-[#C65D3B] mb-6">
              📅 15 de Outubro de 2026
            </h2>

            <p className="mb-4">⏰ Cerimônia às 16h</p>

            <p className="mb-8">
              Estacionamento disponível no local.
            </p>

            <a
              href="https://maps.app.goo.gl/r7XtqtrkTYETjqs46"
              target="_blank"
              className="bg-[#C65D3B] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-[#A34320] transition"
            >
              Abrir no Google Maps
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="shadow-2xl rounded-3xl overflow-hidden"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2741.3661325735306!2d-38.2590159!3d-4.040020800000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b89ecc73e8578b%3A0xf33cfc20ea9f0437!2sSociety%20Club!5e1!3m2!1spt-BR!2sbr!4v1771979302236!5m2!1spt-BR!2sbr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-3xl"
            />
          </motion.div>
        </div>

      </div>
    </main>
  )
}
