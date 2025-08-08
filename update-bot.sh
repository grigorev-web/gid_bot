#!/bin/bash

# Скрипт для обновления Telegram бота
echo "🔄 Начинаем обновление бота..."

# Переходим в папку проекта
cd /opt/telegram-bot

# Останавливаем бота
echo "⏹️ Останавливаем бота..."
pm2 stop telegram-bot

# Получаем обновления из Git
echo "📥 Получаем обновления..."
git pull origin main

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Запускаем миграции базы данных
echo "🗄️ Запускаем миграции..."
npm run migrate

# Запускаем бота
echo "🤖 Запускаем бота..."
pm2 start telegram-bot

# Сохраняем конфигурацию PM2
echo "💾 Сохраняем конфигурацию..."
pm2 save

echo "✅ Бот успешно обновлен и запущен!"
echo "📊 Статус: pm2 status"
echo "📋 Логи: pm2 logs telegram-bot" 