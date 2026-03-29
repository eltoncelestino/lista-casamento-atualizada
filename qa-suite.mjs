// qa-suite.mjs — Suíte completa de testes QA
// node qa-suite.mjs

import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

const BASE = 'http://localhost:3000'
const env  = readFileSync('.env.local', 'utf-8')
const DB   = env.match(/DATABASE_URL="([^"]+)"/)?.[1]
const sql  = neon(DB)

// ── helpers ──────────────────────────────────────────────────────────────────
let passed = 0, failed = 0
const created = { gifts: [], pix: [], confirmacoes: [] }

function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++ }
  else           { console.log(`  ❌ ${label}`); failed++ }
}
const sep = t => console.log(`\n${'─'.repeat(55)}\n🔷 ${t}\n${'─'.repeat(55)}`)

async function req(method, path, body, cookie = '') {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  return { status: res.status, data: await res.json(), headers: res.headers }
}

async function login() {
  const { status, data, headers } = await req('POST', '/api/auth/login', {
    email: 'eltongf2014@gmail.com', password: '$Clarice2026'
  })
  if (status !== 200) { console.log('  ⚠️  Login admin falhou — abortando testes de auth'); return '' }
  return headers.get('set-cookie')?.split(';')[0] || ''
}

// ── 1. AUTENTICAÇÃO ───────────────────────────────────────────────────────────
sep('1. AUTENTICAÇÃO')
const { status: s1 } = await req('POST', '/api/auth/login', { email: '', password: '' })
assert(s1 === 400, 'Login sem credenciais → 400')

const { status: s2 } = await req('POST', '/api/auth/login', { email: 'eltongf2014@gmail.com', password: 'errada' })
assert(s2 === 401, 'Login senha errada → 401')

const { status: s3, data: d3, headers: h3 } = await req('POST', '/api/auth/login', {
  email: 'eltongf2014@gmail.com', password: '$Clarice2026'
})
assert(s3 === 200 && d3.success, 'Login correto → 200 + success')
const cookie = h3.get('set-cookie')?.split(';')[0] || ''
assert(cookie.includes('admin_auth'), 'Cookie admin_auth definido')

const { status: s4, data: d4 } = await req('GET', '/api/auth/me', null, cookie)
assert(s4 === 200 && d4.authenticated, 'Sessão válida após login')
assert(d4.user?.email === 'eltongf2014@gmail.com', 'Email correto na sessão')

const { status: s5 } = await req('GET', '/api/auth/me')
assert(s5 === 401, 'Acesso sem cookie → 401')

// ── 2. PRESENTES — CRUD ───────────────────────────────────────────────────────
sep('2. PRESENTES — CRUD')

// POST válido
const { status: g1, data: gd1 } = await req('POST', '/api/gifts', { name: '[QA] Panela', price: 299.90, description: 'Teste QA' })
assert(g1 === 200 && gd1.id, 'Criar presente válido → 200')
assert(Number(gd1.price) === 299.90, 'Preço salvo corretamente')
assert(gd1.selected === false, 'Presente criado como não reservado')
if (gd1.id) created.gifts.push(gd1.id)

// POST sem nome
const { status: g2 } = await req('POST', '/api/gifts', { price: 100 })
assert(g2 === 400, 'Criar sem nome → 400')

// POST preço inválido
const { status: g3 } = await req('POST', '/api/gifts', { name: '[QA] Inválido', price: 'abc' })
assert(g3 === 400, 'Criar com preço string → 400')

const { status: g4 } = await req('POST', '/api/gifts', { name: '[QA] Zero', price: 0 })
assert(g4 === 400, 'Criar com preço zero → 400')

const { status: g5 } = await req('POST', '/api/gifts', { name: '[QA] Negativo', price: -50 })
assert(g5 === 400, 'Criar com preço negativo → 400')

// GET lista
const { status: g6, data: gd6 } = await req('GET', '/api/gifts')
assert(g6 === 200 && Array.isArray(gd6), 'Listar presentes → 200 + array')
assert(gd6.some(g => g.id === gd1.id), 'Presente criado aparece na lista')

// PUT atualizar
const { status: g7, data: gd7 } = await req('PUT', '/api/gifts', { id: gd1.id, name: '[QA] Panela Atualizada', price: 350, description: 'Atualizado' })
assert(g7 === 200 && gd7.name === '[QA] Panela Atualizada', 'Atualizar presente → 200')
assert(Number(gd7.price) === 350, 'Preço atualizado corretamente')

// ── 3. RESERVA DE PRESENTES ───────────────────────────────────────────────────
sep('3. RESERVA DE PRESENTES')

// Criar presente para reservar
const { data: gr1 } = await req('POST', '/api/gifts', { name: '[QA] Para Reservar', price: 150 })
if (gr1.id) created.gifts.push(gr1.id)

// Reservar sem guestName
const { status: r1 } = await req('POST', '/api/gifts/reserve', { id: gr1.id })
assert(r1 === 400, 'Reservar sem nome → 400')

// Reservar com nome
const { status: r2, data: rd2 } = await req('POST', '/api/gifts/reserve', { id: gr1.id, guestName: 'Convidado QA' })
assert(r2 === 200 && rd2.selected === true, 'Reservar presente → 200 + selected=true')
assert(rd2.selected_by === 'Convidado QA', 'selected_by salvo corretamente')

// Tentar reservar novamente (409)
const { status: r3, data: rd3 } = await req('POST', '/api/gifts/reserve', { id: gr1.id, guestName: 'Outro' })
assert(r3 === 409, 'Dupla reserva → 409')
assert(rd3.error === 'Presente já foi reservado', 'Mensagem de erro correta no 409')

// Reservar ID inexistente
const { status: r4 } = await req('POST', '/api/gifts/reserve', { id: '00000000-0000-0000-0000-000000000000', guestName: 'X' })
assert(r4 === 409, 'Reservar ID inexistente → 409')

// ── 4. CONFIRMAÇÕES DE PRESENÇA ───────────────────────────────────────────────
sep('4. CONFIRMAÇÕES DE PRESENÇA')

const { status: c1, data: cd1 } = await req('POST', '/api/confirmacoes', {
  nome: '[QA] João Silva', email: 'joao@qa.com', mensagem: 'Estarei lá!', comparecera: true
})
assert(c1 === 200 && cd1.id, 'Criar confirmação → 200')
assert(cd1.comparecera === true, 'comparecera=true salvo corretamente')
if (cd1.id) created.confirmacoes.push(cd1.id)

const { status: c2, data: cd2 } = await req('POST', '/api/confirmacoes', {
  nome: '[QA] Maria Souza', email: 'maria@qa.com', mensagem: 'Não poderei ir', comparecera: false
})
assert(c2 === 200 && cd2.comparecera === false, 'Criar confirmação negativa → 200')
if (cd2.id) created.confirmacoes.push(cd2.id)

// Sem comparecera — deve default true
const { status: c3, data: cd3 } = await req('POST', '/api/confirmacoes', { nome: '[QA] Sem Flag' })
assert(c3 === 200 && cd3.comparecera === true, 'comparecera default true quando omitido')
if (cd3.id) created.confirmacoes.push(cd3.id)

// GET lista
const { status: c4, data: cd4 } = await req('GET', '/api/confirmacoes')
assert(c4 === 200 && Array.isArray(cd4), 'Listar confirmações → 200 + array')

// PUT alternar presença
const { status: c5, data: cd5 } = await req('PUT', '/api/confirmacoes', { id: cd1.id, comparecera: false })
assert(c5 === 200 && cd5.comparecera === false, 'Alternar presença → 200')

// DELETE
const { status: c6 } = await fetch(`${BASE}/api/confirmacoes?id=${cd3.id}`, { method: 'DELETE' }).then(r => ({ status: r.status }))
assert(c6 === 200, 'Deletar confirmação → 200')
created.confirmacoes = created.confirmacoes.filter(id => id !== cd3.id)

// ── 5. CONTRIBUIÇÕES PIX ──────────────────────────────────────────────────────
sep('5. CONTRIBUIÇÕES PIX')

const { status: p1, data: pd1 } = await req('POST', '/api/pix', { name: '[QA] Família Teste', amount: 500 })
assert(p1 === 200 && pd1.id, 'Criar contribuição PIX → 200')
assert(Number(pd1.amount) === 500, 'Valor PIX salvo corretamente')
if (pd1.id) created.pix.push(pd1.id)

const { status: p2, data: pd2 } = await req('POST', '/api/pix', { name: '[QA] Com Comprovante', amount: 200, receipt_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' })
assert(p2 === 200 && pd2.receipt_url?.startsWith('data:image'), 'PIX com comprovante base64 → salvo corretamente')
if (pd2.id) created.pix.push(pd2.id)

// GET lista
const { status: p3, data: pd3 } = await req('GET', '/api/pix')
assert(p3 === 200 && Array.isArray(pd3), 'Listar PIX → 200 + array')
assert(pd3.some(p => p.id === pd1.id), 'Contribuição aparece na lista')

// Verificar ordenação (mais recente primeiro)
if (pd3.length >= 2) {
  const datas = pd3.map(p => new Date(p.created_at).getTime())
  const ordenado = datas.every((d, i) => i === 0 || datas[i - 1] >= d)
  assert(ordenado, 'PIX ordenado por data decrescente')
}

// ── 6. UPLOAD DE COMPROVANTE ──────────────────────────────────────────────────
sep('6. UPLOAD DE COMPROVANTE (base64)')

// Simula um arquivo PNG mínimo via FormData
const { FormData, Blob } = await import('node:buffer').catch(() => ({ FormData: global.FormData, Blob: global.Blob }))

const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const pngBuffer = Buffer.from(pngBase64, 'base64')

const formData = new global.FormData()
formData.append('file', new global.Blob([pngBuffer], { type: 'image/png' }), 'comprovante-qa.png')

const uploadRes = await fetch(`${BASE}/api/pix/upload`, { method: 'POST', body: formData })
const uploadData = await uploadRes.json()

assert(uploadRes.status === 200, 'Upload de imagem PNG → 200')
assert(uploadData.url?.startsWith('data:image/png;base64,'), 'URL retornada é base64 de imagem PNG')

// Upload sem arquivo
const emptyForm = new global.FormData()
const uploadEmpty = await fetch(`${BASE}/api/pix/upload`, { method: 'POST', body: emptyForm })
assert(uploadEmpty.status === 400, 'Upload sem arquivo → 400')

// ── 7. SEGURANÇA ──────────────────────────────────────────────────────────────
sep('7. SEGURANÇA')

// SQL Injection no nome do presente
const { status: sec1, data: secd1 } = await req('POST', '/api/gifts', {
  name: "'; DROP TABLE gifts; --", price: 100
})
assert(sec1 === 200 && secd1.id, 'SQL injection no nome → tratado como string (parameterized query)')
if (secd1.id) created.gifts.push(secd1.id)

// XSS no nome
const { status: sec2, data: secd2 } = await req('POST', '/api/gifts', {
  name: '<script>alert("xss")</script>', price: 100
})
assert(sec2 === 200 && secd2.name === '<script>alert("xss")</script>', 'XSS salvo como string — sanitização deve ser feita no front')
if (secd2.id) created.gifts.push(secd2.id)

// Payload gigante
const bigName = 'A'.repeat(10000)
const { status: sec3 } = await req('POST', '/api/gifts', { name: bigName, price: 100 })
assert([200, 400, 500].includes(sec3), `Payload gigante (10k chars) → status ${sec3}`)
const { data: afterBig } = await req('GET', '/api/gifts')
const bigGift = afterBig.find(g => g.name === bigName)
if (bigGift) created.gifts.push(bigGift.id)

// DELETE sem ID
const { status: sec4 } = await fetch(`${BASE}/api/gifts`, { method: 'DELETE' }).then(r => ({ status: r.status }))
assert(sec4 === 400, 'DELETE sem ID → 400')

// ── 8. BANCO DE DADOS — VERIFICAÇÃO DIRETA ────────────────────────────────────
sep('8. VERIFICAÇÃO DIRETA NO BANCO')

const dbGifts = await sql`SELECT COUNT(*) as total FROM gifts`
assert(Number(dbGifts[0].total) > 0, `Banco tem ${dbGifts[0].total} presentes`)

const dbPix = await sql`SELECT COUNT(*) as total, SUM(amount) as soma FROM pix_contributions`
assert(Number(dbPix[0].total) > 0, `Banco tem ${dbPix[0].total} contribuições PIX`)
assert(Number(dbPix[0].soma) > 0, `Total arrecadado no banco: R$ ${Number(dbPix[0].soma).toFixed(2)}`)

const dbConfs = await sql`SELECT COUNT(*) as total FROM confirmacoes`
assert(Number(dbConfs[0].total) > 0, `Banco tem ${dbConfs[0].total} confirmações`)

const dbAdmin = await sql`SELECT COUNT(*) as total FROM admin_users WHERE email = 'eltongf2014@gmail.com'`
assert(Number(dbAdmin[0].total) === 1, 'Admin eltongf2014@gmail.com existe no banco')

const dbReceipt = await sql`SELECT COUNT(*) as total FROM pix_contributions WHERE receipt_url LIKE 'data:%'`
assert(Number(dbReceipt[0].total) > 0, `${dbReceipt[0].total} comprovante(s) base64 salvo(s) no banco`)

// ── 9. LOGOUT ─────────────────────────────────────────────────────────────────
sep('9. LOGOUT')
const { status: lo1 } = await req('POST', '/api/auth/logout', {}, cookie)
assert(lo1 === 200, 'Logout → 200')

const { status: lo2 } = await req('GET', '/api/auth/me', null, cookie)
assert(lo2 === 401, 'Sessão inválida após logout → 401')

// ── LIMPEZA ───────────────────────────────────────────────────────────────────
sep('LIMPEZA — removendo dados de teste')

for (const id of created.gifts) {
  const r = await fetch(`${BASE}/api/gifts?id=${id}`, { method: 'DELETE' })
  console.log(`  🗑️  Gift ${id.slice(0, 8)}... → ${r.status}`)
}
for (const id of created.confirmacoes) {
  const r = await fetch(`${BASE}/api/confirmacoes?id=${id}`, { method: 'DELETE' })
  console.log(`  🗑️  Confirmação ${id.slice(0, 8)}... → ${r.status}`)
}
for (const id of created.pix) {
  await sql`DELETE FROM pix_contributions WHERE id = ${id}`
  console.log(`  🗑️  PIX ${id.slice(0, 8)}... → removido`)
}

// ── RESULTADO FINAL ───────────────────────────────────────────────────────────
const total = passed + failed
console.log(`\n${'═'.repeat(55)}`)
console.log(`📊 RESULTADO: ${passed}/${total} testes passaram`)
if (failed > 0) console.log(`   ⚠️  ${failed} teste(s) falharam`)
else console.log(`   🎉 Todos os testes passaram!`)
console.log(`${'═'.repeat(55)}\n`)
