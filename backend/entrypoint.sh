#!/bin/sh

# Verifica se o seed já foi executado
if [ ! -f /app/.seed_executed ]; then
    echo "Executando seed pela primeira vez..."
    npm run seed
    touch /app/.seed_executed
    echo "Seed executado com sucesso!"
fi

# Inicia a aplicação
exec npm start