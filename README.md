# 💍 Lista de Casamento Digital - Clarice & Elton (Versão Atualizada)

![Status do Deploy](https://img.shields.io/badge/Deploy-Vercel-success?style=for-the-badge&logo=vercel)
![Tech](https://img.shields.io/badge/Tech-Next.js%2016-black?style=for-the-badge&logo=next.js)
![Database](https://img.shields.io/badge/Database-Neon-blueviolet?style=for-the-badge&logo=postgresql)

Sistema completo e elegante para gestão de lista de presentes e arrecadação de contribuições via PIX. **Versão atualizada usando Neon Database em vez do Supabase** para evitar pausas automáticas do plano gratuito.

---

## 🚀 Principais Mudanças

| Antes (Supabase) | Agora (Neon) |
| :--- | :--- |
| Autenticação Supabase Auth | Autenticação própria com bcrypt |
| Real-time subscriptions | API Routes REST |
| Storage de arquivos | URLs externas (S3/R2) |
| Pausa após inatividade | **Sem pausas** |

---

## 🛠️ Stack Técnica

| Tecnologia | Descrição |
| :--- | :--- |
| **Next.js 16** | Framework React com App Router |
| **Tailwind CSS 4** | CSS utilitário moderno |
| **TypeScript** | Segurança de tipos |
| **Neon** | PostgreSQL serverless (sem pausas) |
| **Framer Motion** | Animações suaves |
| **Vercel** | Deploy automático |

---

## ⚙️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone [URL_DO_REPO]
cd lista-casamento-atualizada
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados no Neon

1. Acesse [https://console.neon.tech](https://console.neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a **Connection String** (pooler mode)
5. No SQL Editor do Neon, execute o arquivo `schema.sql`

### 4. Configure as variáveis de ambiente

Crie o arquivo `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

### 5. Inicie o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Schema do Banco de Dados

O arquivo `schema.sql` contém as tabelas necessárias:

- **gifts** - Presentes da lista
- **pix_contributions** - Contribuições via PIX
- **confirmacoes** - Confirmações de presença
- **admin_users** - Usuários administrativos

### Usuário Admin Padrão
- **Email:** `admin@casamento.com`
- **Senha:** `admin123`

⚠️ **Importante:** Troque a senha após o primeiro login!

---

## 📁 Estrutura do Projeto

```
lista-casamento-atualizada/
├── app/
│   ├── api/
│   │   ├── auth/          # Rotas de autenticação
│   │   ├── gifts/         # CRUD de presentes
│   │   ├── pix/           # Contribuições PIX
│   │   └── confirmacoes/  # Confirmações de presença
│   ├── admin/
│   │   └── login/
│   ├── components/
│   ├── presentes/
│   ├── pix/
│   ├── confirmar-presenca/
│   ├── localizacao/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── neon.ts            # Cliente Neon
│   └── auth.ts            # Funções de autenticação
├── schema.sql             # Schema do banco
└── .env.local             # Variáveis de ambiente
```

---

## 🔐 Autenticação

A autenticação agora é feita via API Routes com cookies HTTP-only:

- `POST /api/auth/login` - Faz login
- `POST /api/auth/logout` - Faz logout
- `GET /api/auth/me` - Verifica sessão

---

## 📦 Upload de Comprovantes

**Atenção:** O Neon não armazena arquivos. Para upload de comprovantes, use:

1. **AWS S3** + Pre-signed URLs
2. **Cloudflare R2** (gratuito, compatível com S3)
3. **Uploadcare** (fácil integração)
4. **Vercel Blob** (integrado com Vercel)

Para uma solução simples, você pode modificar o endpoint `/api/pix` para gerar URLs pre-signed do S3/R2.

---

## 🚀 Deploy na Vercel

1. Conecte seu repositório GitHub na Vercel
2. Adicione a variável `DATABASE_URL` nas configurações do projeto
3. Deploy automático!

---

## 📝 Licença

Projeto desenvolvido para fins pessoais.

Desenvolvido por Elton Celestino 🚀
