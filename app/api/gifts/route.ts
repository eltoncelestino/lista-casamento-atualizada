import { query } from '@/lib/neon'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const gifts = await query(`
      SELECT * FROM gifts
      ORDER BY selected ASC, name ASC
    `)
    return NextResponse.json(gifts)
  } catch (error) {
    console.error('Erro ao buscar presentes:', error)
    return NextResponse.json({ error: 'Erro ao buscar presentes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, product_url, image_url } = body

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    const priceNum = parseFloat(price)
    if (!price || typeof price === 'string' && !/^\d+(\.\d+)?$/.test(String(price).trim()) || isNaN(priceNum) || priceNum <= 0)
      return NextResponse.json({ error: 'Valor deve ser um número positivo' }, { status: 400 })

    const result = await query(`
      INSERT INTO gifts (name, description, price, product_url, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, priceNum, product_url, image_url])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Erro ao criar presente:', error)
    return NextResponse.json({ error: 'Erro ao criar presente' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, price, product_url, image_url } = body

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    const priceNum = parseFloat(price)
    if (!price || typeof price === 'string' && !/^\d+(\.\d+)?$/.test(String(price).trim()) || isNaN(priceNum) || priceNum <= 0)
      return NextResponse.json({ error: 'Valor deve ser um número positivo' }, { status: 400 })

    const result = await query(`
      UPDATE gifts
      SET name = $1, description = $2, price = $3, product_url = $4, image_url = $5
      WHERE id = $6
      RETURNING *
    `, [name, description, priceNum, product_url, image_url, id])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Erro ao atualizar presente:', error)
    return NextResponse.json({ error: 'Erro ao atualizar presente' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID necessário' }, { status: 400 })
    }

    await query('DELETE FROM gifts WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover presente:', error)
    return NextResponse.json({ error: 'Erro ao remover presente' }, { status: 500 })
  }
}
