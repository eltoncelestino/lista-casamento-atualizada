import { query } from '@/lib/neon'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const contributions = await query(`
      SELECT * FROM pix_contributions
      ORDER BY created_at DESC
    `)
    return NextResponse.json(contributions)
  } catch (error) {
    console.error('Erro ao buscar contribuições:', error)
    return NextResponse.json({ error: 'Erro ao buscar contribuições' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, amount, receipt_url } = body

    const result = await query(`
      INSERT INTO pix_contributions (name, amount, receipt_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, amount, receipt_url])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Erro ao criar contribuição:', error)
    return NextResponse.json({ error: 'Erro ao criar contribuição' }, { status: 500 })
  }
}
