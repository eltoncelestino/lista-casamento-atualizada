import { query } from '@/lib/neon'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, guestName } = body

    // Verifica se o presente ainda está disponível
    const [gift] = await query(`
      SELECT * FROM gifts WHERE id = $1 AND selected = false
    `, [id])

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente já foi reservado' },
        { status: 409 }
      )
    }

    // Reserva o presente
    const result = await query(`
      UPDATE gifts
      SET selected = true, selected_by = $1, selected_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [guestName, id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Erro ao reservar presente:', error)
    return NextResponse.json({ error: 'Erro ao reservar presente' }, { status: 500 })
  }
}
