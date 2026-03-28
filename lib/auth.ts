import { query } from './neon'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const rows = await query<{ id: string; email: string; password_hash: string }>(
      'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
      [email]
    )

    if (rows.length === 0) {
      return null
    }

    const user = rows[0]
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return null
    }

    return { id: user.id, email: user.email }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return null
  }
}

export async function createUser(email: string, password: string): Promise<User | null> {
  try {
    const passwordHash = await bcrypt.hash(password, 10)

    const rows = await query<{ id: string; email: string }>(
      `INSERT INTO admin_users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, passwordHash]
    )

    return { id: rows[0].id, email: rows[0].email }
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return null
  }
}
