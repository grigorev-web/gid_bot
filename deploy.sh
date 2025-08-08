#!/bin/bash

# Скрипт развертывания Telegram бота на сервере
echo "🚀 Начинаем развертывание Telegram бота..."

# Обновляем систему
echo "📦 Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js и npm (если не установлены)
if ! command -v node &> /dev/null; then
    echo "📥 Устанавливаем Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Устанавливаем PM2 глобально
echo "📥 Устанавливаем PM2..."
sudo npm install -g pm2

# Создаем папку для проекта (если не существует)
PROJECT_DIR="/opt/telegram-bot"
echo "📁 Создаем папку проекта: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Копируем файлы проекта (если нужно)
# cp -r . $PROJECT_DIR/

# Переходим в папку проекта
cd $PROJECT_DIR

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Создаем конфигурационный файл
echo "⚙️ Создаем конфигурацию..."
if [ ! -f "config.js" ]; then
    cp config.example.js config.js
    echo "⚠️  Не забудьте настроить config.js с вашими токенами!"
fi

# Запускаем миграции базы данных
echo "🗄️ Запускаем миграции базы данных..."
npm run migrate

# Создаем PM2 конфигурацию
echo "🔧 Создаем PM2 конфигурацию..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
EOF

# Создаем папку для логов
mkdir -p logs

# Запускаем приложение через PM2
echo "🤖 Запускаем бота через PM2..."
pm2 start ecosystem.config.js

# Сохраняем PM2 конфигурацию для автозапуска
echo "💾 Сохраняем PM2 конфигурацию..."
pm2 save
pm2 startup

echo "✅ Развертывание завершено!"
echo "📊 Статус: pm2 status"
echo "📋 Логи: pm2 logs telegram-bot"
echo "🔄 Перезапуск: pm2 restart telegram-bot"
echo "⏹️ Остановка: pm2 stop telegram-bot" 