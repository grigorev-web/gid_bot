# 🚀 Развертывание Telegram Bot на сервере

## 📋 Быстрая настройка

### 1. **Первоначальная настройка сервера**
```bash
# Запустите скрипт настройки
bash setup.sh
```

### 2. **Клонирование и запуск**
```bash
# Клонируйте репозиторий
cd /opt/telegram-bot
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Установите зависимости (включая PM2)
npm install

# Настройте конфигурацию
cp config.example.js config.js
nano config.js  # Введите ваши токены

# Запустите миграции
npm run migrate

# Запустите через PM2
npx pm2 start ecosystem.config.js
npx pm2 save
npx pm2 startup
```

## 🔄 Обновление бота

### **Автоматическое обновление:**
```bash
# Запустите скрипт развертывания
bash deploy.sh
```

### **Или вручную:**
```bash
cd /opt/telegram-bot
git pull origin main
npm install
npm run migrate
npx pm2 restart telegram-bot
```

## 📊 Управление

```bash
npx pm2 status          # Статус
npx pm2 logs telegram-bot # Логи
npx pm2 restart telegram-bot # Перезапуск
npx pm2 stop telegram-bot   # Остановка
```

## 🎯 Готово!

Бот будет:
- ✅ Автоматически перезапускаться при сбоях
- ✅ Запускаться при старте сервера
- ✅ Работать стабильно 24/7 