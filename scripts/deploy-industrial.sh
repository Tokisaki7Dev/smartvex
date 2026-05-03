#!/bin/bash
echo "🚀 Iniciando Deploy Industrial: Validação de Integridade..."

# 1. Validação de Variáveis
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ ERRO: Variáveis de ambiente Supabase ausentes no Render!"
  exit 1
fi

# 2. Commit Final de Estabilização
git add .
git commit -m "chore: industrial grade robustness and automated deploy ready"
git push origin main

echo "✅ Deploy Finalizado. Infraestrutura Industrial Sincronizada."
