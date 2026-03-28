import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "./components/Navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Clarice & Elton",
  description: "Lista de Presentes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="bg-[#FAF7F2]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#FAF7F2] text-[#4A443F] antialiased`}
      >
        <Navbar />

        <main className="bg-[#FDF6F0] min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
