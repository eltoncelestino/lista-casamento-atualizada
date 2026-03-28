# 🚀 Configuração Rápida - Lista de Casamento Atualizada

## Passo 1: Criar Banco no Neon

1. Acesse https://console.neon.tech
2. Clique em **"Create Project"**
3. Dê um nome (ex: `lista-casamento`)
4. Escolha a região mais próxima (us-east-1 para Brasil)
5. Clique em **"Create"**

## Passo 2: Executar o Schema

1. No painel do projeto, clique em **"SQL"** no menu lateral
2. Copie TODO o conteúdo do arquivo `schema.sql`
3. Cole no editor SQL e clique em **"Run"**
4. Confirme que as 4 tabelas foram criadas

## Passo 3: Pegar Connection String

1. No painel do Neon, vá em **"Connection Details"**
2. Copie a string que começa com `postgres://` ou `postgresql://`
3. Deve ser algo como:
   ```
   postgresql://user:password@ep-xyz.region.aws.neon.tech/dbname?sslmode=require
   ```

## Passo 4: Configurar .env.local

O arquivo `.env.local` já existe. Apenas substitua o valor:

```env
DATABASE_URL="cole_sua_connection_string_aqui"
```

## Passo 5: Rodar o Projeto

```bash
npm run dev
```

Acesse http://localhost:3000

## Passo 6: Acessar o Admin

1. Vá para http://localhost:3000/admin
2. Use as credenciais padrão:
   - **Email:** `admin@casamento.com`
   - **Senha:** `admin123`

### ⚠️ IMPORTANTE: Trocar a Senha!

No banco de dados Neon, execute:

```sql
-- Gere um novo hash em https://bcrypt-generator.com/
-- Use round 10

UPDATE admin_users
SET password_hash = '$2b$10$NOVO_HASH_AQUI'
WHERE email = 'admin@casamento.com';
```

Ou crie um novo usuário:

```sql
INSERT INTO admin_users (email, password_hash)
VALUES ('seu@email.com', '$2b$10$SEU_HASH_AQUI');
```

---

## 📡 Deploy na Vercel

1. Push no GitHub
2. Acesse https://vercel.com
3. Importe o repositório
4. Em **Environment Variables**, adicione:
   ```
   DATABASE_URL = postgresql://...
   ```
5. Clique em **Deploy**

---

## 🎨 Personalização

### Mudar Data do Casamento
Edite `app/components/Countdown.tsx`:
```typescript
const targetDate = new Date("2026-05-09T16:00:00").getTime()
```

### Mudar Cores
Edite `app/globals.css`:
```css
--color-terracota: #C65D3B;  /* Sua cor principal */
```

### Mudar Chave PIX
Edite `app/pix/page.tsx`:
```typescript
const pixCode = `SEU_CODIGO_AQUI`
const pixKey = "sua-chave-pix@email.com"
```

---

## ✅ Checklist Final

- [ ] Banco criado no Neon
- [ ] Schema executado
- [ ] `.env.local` configurado
- [ ] Projeto rodando localmente
- [ ] Senha admin trocada
- [ ] Deploy na Vercel feito

---

**Dúvidas?** Consulte o `README.md` para mais detalhes.
