FROM node:20-slim

# Instala o OpenSSL exigido pelo Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

# Cria um script de entrada personalizado
RUN echo '#!/bin/sh\n\
if [ ! -f /app/.seed_executed ] && [ -f /app/prisma/seed.ts ]; then\n\
  echo "🔄 Executando seed pela primeira vez..."\n\
  npx prisma db push --skip-generate\n\
  npm run seed\n\
  touch /app/.seed_executed\n\
  echo "✅ Seed executado com sucesso!"\n\
else\n\
  echo "⏭️ Seed já foi executado anteriormente ou arquivo não encontrado"\n\
fi\n\
\n\
# Inicia a aplicação em modo dev\n\
npm run dev\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["/entrypoint.sh"]