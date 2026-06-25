# Sofulano Ukulondja

Plataforma full-stack de aprendizagem de línguas (Node/Express + React/Vite + Prisma + SQLite).

## Funcionalidades

**Aluno**
- Splash de boas-vindas com o nome da plataforma
- Login / Registo / Recuperação de senha por código de 6 dígitos enviado por email
- Páginas de autenticação centradas (sem navbar) com botão "Voltar"
- Inscrição em cursos, lições, exercícios (preencher lacunas, frases embaralhadas, tradução)
- Quizzes de múltipla escolha
- Chat por curso (apenas alunos aprovados)
- Histórico de exercícios e quizzes com data de cada actividade
- Notificações
- Tradutor automático (MyMemory) + favoritos + histórico de traduções
- Progresso por curso

**Admin**
- Dashboard com gráficos (Recharts): alunos, cursos, inscrições por curso, inscrições por dia, distribuição (aprovadas/pendentes/rejeitadas)
- Gestão de cursos com **upload de imagem de capa**
- Gestão de lições, exercícios e quizzes por curso
- Aprovar / rejeitar inscrições
- Pesquisar alunos e enviar mensagem (notificação na plataforma + email opcional)
- Gestão de utilizadores

**Backend**
- Documentação **Swagger** em `/docs` (todas as rotas)
- JWT, bcrypt, Zod, Helmet, CORS, rate-limit
- Multer para upload de imagens (servidas em `/uploads`)
- Nodemailer (modo console se SMTP não configurado)

## Como rodar

### Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run seed
npm run dev
# API:    http://localhost:4000    nova  
# Swagger: http://localhost:4000/docs
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# http://localhost:5173        nova  4001
```

## Credenciais de teste
- Admin: `admin@sofulano.com` / `admin123`
- Aluno: `aluno@sofulano.com` / `aluno123`

## Recuperação de senha
Se não tiveres SMTP configurado, o código de 6 dígitos aparece no **console do backend**.
