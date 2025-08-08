# 🚀 Развертывание Telegram Bot на сервере

## 📋 Требования к серверу

- **ОС**: Ubuntu 18.04+ / CentOS 7+ / Debian 9+
- **RAM**: Минимум 512MB (рекомендуется 1GB+)
- **CPU**: 1 ядро (рекомендуется 2+)
- **Диск**: 10GB свободного места
- **Сеть**: Стабильное интернет-соединение

## 🔧 Подготовка сервера

### 1. **Подключение к серверу**
```bash
ssh user@your-server-ip
```

### 2. **Обновление системы**
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. **Установка Node.js**
```bash
# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

### 4. **Установка PM2**
```bash
sudo npm install -g pm2
```

## 📦 Развертывание проекта

### 1. **Клонирование репозитория**
```bash
# Создаем папку для проекта
sudo mkdir -p /opt/telegram-bot
sudo chown $USER:$USER /opt/telegram-bot
cd /opt/telegram-bot

# Клонируем репозиторий (замените на ваш URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### 2. **Установка зависимостей**
```bash
npm install
```

### 3. **Настройка конфигурации**
```bash
# Копируем пример конфигурации
cp config.example.js config.js

# Редактируем конфигурацию
nano config.js
```

**Важные настройки в `config.js`:**
```javascript
module.exports = {
    TELEGRAM: {
        BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE', // Получите у @BotFather
    },
    GIGACHAT_AUTH_KEY: 'YOUR_GIGACHAT_AUTH_KEY_HERE',
    DATABASE: {
        HOST: 'your_mysql_host',
        PORT: 3306,
        USER: 'your_mysql_user',
        PASSWORD: 'your_mysql_password',
        NAME: 'your_database_name',
    }
};
```

### 4. **Настройка базы данных**
```bash
# Запуск миграций
npm run migrate
```

### 5. **Запуск через PM2**
```bash
# Запуск приложения
pm2 start ecosystem.config.js

# Сохранение конфигурации для автозапуска
pm2 save
pm2 startup
```

## 🔍 Управление приложением

### **Основные команды PM2:**

```bash
# Статус приложений
pm2 status

# Просмотр логов
pm2 logs telegram-bot

# Просмотр логов в реальном времени
pm2 logs telegram-bot --lines 100

# Перезапуск приложения
pm2 restart telegram-bot

# Остановка приложения
pm2 stop telegram-bot

# Удаление приложения из PM2
pm2 delete telegram-bot

# Мониторинг в реальном времени
pm2 monit
```

### **Просмотр логов:**
```bash
# Логи PM2
pm2 logs telegram-bot

# Логи приложения
tail -f logs/bot.log
tail -f logs/combined.log
```

## 🔧 Автоматическое обновление

### **Скрипт для обновления:**
```bash
#!/bin/bash
# update-bot.sh

cd /opt/telegram-bot

# Останавливаем бота
pm2 stop telegram-bot

# Получаем обновления
git pull origin main

# Устанавливаем зависимости
npm install

# Запускаем миграции
npm run migrate

# Запускаем бота
pm2 start telegram-bot

# Сохраняем конфигурацию
pm2 save

echo "✅ Бот обновлен и запущен!"
```

### **Настройка автоматического обновления:**
```bash
# Делаем скрипт исполняемым
chmod +x update-bot.sh

# Добавляем в cron для автоматического обновления (опционально)
crontab -e
# Добавить строку: 0 3 * * * /opt/telegram-bot/update-bot.sh
```

## 🛡️ Безопасность

### **Настройка файрвола:**
```bash
# Установка UFW
sudo apt install ufw

# Настройка правил
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **Настройка SSL (если нужно):**
```bash
# Установка Certbot
sudo apt install certbot

# Получение SSL сертификата
sudo certbot certonly --standalone -d your-domain.com
```

## 📊 Мониторинг

### **Установка мониторинга:**
```bash
# Установка PM2 Plus (опционально)
pm2 install pm2-server-monit
```

### **Настройка уведомлений:**
```bash
# Установка PM2 Telegram уведомлений
pm2 install pm2-telegram
```

## 🔄 Автоматический перезапуск

PM2 автоматически перезапускает приложение при:
- ✅ Сбое процесса
- ✅ Превышении лимита памяти (1GB)
- ✅ Перезагрузке сервера
- ✅ Ошибках в коде

## 📋 Проверка работоспособности

### **1. Проверка статуса:**
```bash
pm2 status
```

### **2. Проверка логов:**
```bash
pm2 logs telegram-bot --lines 50
```

### **3. Тестирование бота:**
- Отправьте `/start` в Telegram
- Проверьте ответ бота
- Проверьте логи на наличие ошибок

## 🚨 Устранение неполадок

### **Бот не отвечает:**
```bash
# Проверьте статус
pm2 status

# Проверьте логи
pm2 logs telegram-bot

# Перезапустите бота
pm2 restart telegram-bot
```

### **Ошибки базы данных:**
```bash
# Проверьте подключение к БД
mysql -h your_host -u your_user -p your_database

# Запустите миграции заново
npm run migrate
```

### **Проблемы с токенами:**
```bash
# Проверьте конфигурацию
cat config.js

# Проверьте токены в Telegram
# Отправьте /mybots в @BotFather
```

## 📈 Оптимизация производительности

### **Настройка PM2 для продакшена:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: 'index.js',
    instances: 'max', // Использовать все ядра
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=512'
  }]
};
```

### **Настройка Node.js:**
```bash
# Увеличить лимит памяти
export NODE_OPTIONS="--max-old-space-size=512"
```

## 🎯 Готово!

После выполнения всех шагов ваш бот будет:
- ✅ Автоматически запускаться при старте сервера
- ✅ Перезапускаться при сбоях
- ✅ Логировать все операции
- ✅ Работать стабильно 24/7

**Команды для управления:**
```bash
pm2 status          # Статус
pm2 logs telegram-bot # Логи
pm2 restart telegram-bot # Перезапуск
pm2 stop telegram-bot   # Остановка
``` 