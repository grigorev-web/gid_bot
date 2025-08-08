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

# Установите зависимости
npm install

# Настройте конфигурацию
cp config.example.js config.js
nano config.js  # Введите ваши токены

# Запустите миграции
npm run migrate

# Запустите через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
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
pm2 restart telegram-bot
```

## 📊 Управление

```bash
pm2 status          # Статус
pm2 logs telegram-bot # Логи
pm2 restart telegram-bot # Перезапуск
pm2 stop telegram-bot   # Остановка
```

## 🎯 Готово!

Бот будет:
- ✅ Автоматически перезапускаться при сбоях
- ✅ Запускаться при старте сервера
- ✅ Работать стабильно 24/7 