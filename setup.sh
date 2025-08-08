#!/bin/bash

# Первоначальная настройка сервера
echo "🔧 Настройка сервера..."

# Устанавливаем Node.js
echo "📥 Устанавливаем Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем PM2
echo "📥 Устанавливаем PM2..."
sudo npm install -g pm2

# Создаем папку проекта
echo "📁 Создаем папку проекта..."
sudo mkdir -p /opt/telegram-bot
sudo chown $USER:$USER /opt/telegram-bot

echo "✅ Настройка завершена!"
echo "📝 Теперь клонируйте репозиторий в /opt/telegram-bot" 