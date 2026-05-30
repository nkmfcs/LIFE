#!/bin/bash
set -e

echo "🚀 Деплой LIFE WEB на сервер..."

ssh uz-user@89.126.221.198 << 'EOF'
  cd /home/uz-user/life-web
  git pull origin main
  docker-compose down
  docker-compose up -d --build
  echo "✅ Готово!"
EOF

echo "🌐 Сайт: https://diary.dukonos.com"
