import { query } from '@/lib/neon'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const confirmacoes = await query(`
      SELECT * FROM confirmacoes
      ORDER BY created_at DESC
    `)
    return NextResponse.json(confirmacoes)
  } catch (error) {
    console.error('Erro ao buscar confirmações:', error)
    return NextResponse.json({ error: 'Erro ao buscar confirmações' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, mensagem, comparecera } = body

    const result = await query(`
      INSERT INTO confirmacoes (nome, email, mensagem, comparecera)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [nome, email, mensagem, comparecera ?? true])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Erro ao criar confirmação:', error)
    return NextResponse.json({ error: 'Erro ao criar confirmação' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, comparecera } = body

    const result = await query(`
      UPDATE confirmacoes
      SET comparecera = $1
      WHERE id = $2
      RETURNING *
    `, [comparecera, id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Erro ao atualizar confirmação:', error)
    return NextResponse.json({ error: 'Erro ao atualizar confirmação' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID necessário' }, { status: 400 })
    }

    await query('DELETE FROM confirmacoes WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover confirmação:', error)
    return NextResponse.json({ error: 'Erro ao remover confirmação' }, { status: 500 })
  }
}
