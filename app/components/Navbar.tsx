"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="w-full bg-[#FAF7F2] border-b border-stone-200 sticky top-0 z-50">

      <div className="w-full px-6 md:px-8 py-5 flex justify-between items-center">

        <Link
          href="/"
          className="text-xl md:text-2xl font-serif tracking-widest text-[#C65D3B]"
        >
          CLARICE & ELTON
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex gap-10 text-sm uppercase tracking-widest font-semibold text-[#4A443F]">
          <Link href="/" className="hover:text-[#C65D3B] transition">Início</Link>
          <Link href="/confirmar-presenca" className="hover:text-[#C65D3B] transition">Confirmar Presença</Link>
          <Link href="/presentes" className="hover:text-[#C65D3B] transition">Presentes</Link>
          <Link href="/pix" className="hover:text-[#C65D3B] transition">PIX</Link>
          <Link href="/localizacao" className="hover:text-[#C65D3B] transition">Localização</Link>
          <Link href="/admin" className="hover:text-[#C65D3B] transition">Admin</Link>
        </div>

        {/* BOTÃO MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1"
        >
          <span className="w-6 h-[2px] bg-[#4A443F]" />
          <span className="w-6 h-[2px] bg-[#4A443F]" />
          <span className="w-6 h-[2px] bg-[#4A443F]" />
        </button>
      </div>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden px-6 pb-6 flex flex-col gap-6 text-sm uppercase tracking-widest font-semibold text-[#4A443F] bg-[#FAF7F2]"
          >
            <Link href="/" onClick={() => setOpen(false)}>Início</Link>
            <Link href="/confirmar-presenca" onClick={() => setOpen(false)}>Confirmar Presença</Link>
            <Link href="/presentes" onClick={() => setOpen(false)}>Presentes</Link>
            <Link href="/pix" onClick={() => setOpen(false)}>PIX</Link>
            <Link href="/localizacao" onClick={() => setOpen(false)}>Localização</Link>
            <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  )
}
