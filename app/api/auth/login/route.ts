import { authenticateUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Cria uma sessão simples (em produção, use JWT ou sessão real)
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email }
    })

    // Define um cookie simples para autenticação
    response.cookies.set('admin_auth', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return NextResponse.json({ error: 'Erro na autenticação' }, { status: 500 })
  }
}
