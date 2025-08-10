# 🔒 Настройка HTTPS для Яндекс Парсера

## 🚀 Быстрый старт

### 1. Создание SSL сертификата
```bash
# Сделайте скрипт исполняемым (если еще не сделано)
chmod +x create_ssl.sh

# Запустите создание сертификата
./create_ssl.sh
```

### 2. Запуск сервера
```bash
npm start
```

## 📋 Что изменилось в server.js

- ✅ Добавлена поддержка HTTPS
- ✅ Автоматическое создание папки ssl/
- ✅ Запуск HTTP сервера на порту 80
- ✅ Запуск HTTPS сервера на порту 443
- ✅ Улучшенная главная страница с информацией о протоколах

## 🌐 Доступные URL

После настройки HTTPS:

- **HTTP**: `http://YOUR_IP:80` (или просто `http://YOUR_IP`)
- **HTTPS**: `https://YOUR_IP:443` (или просто `https://YOUR_IP`)

## 🔧 Ручная настройка SSL

Если скрипт не работает:

```bash
# Создайте папку ssl
mkdir ssl

# Создайте самоподписанный сертификат
openssl req -x509 -newkey rsa:4096 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -days 365 \
    -nodes \
    -subj "/C=RU/ST=State/L=City/O=YandexParser/CN=YOUR_IP"
```

## ⚠️ Важные моменты

1. **Порт 443 требует root прав** - запускайте с sudo
2. **Самоподписанный сертификат** - браузер покажет предупреждение
3. **Для продакшена** используйте Let's Encrypt

## 🚨 Решение проблем

### Порт 443 занят
```bash
# Измените порт в server.js
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
```

### Нет прав на порт 443
```bash
# Запустите с sudo
sudo npm start

# Или используйте порт выше 1024
HTTPS_PORT=8443 npm start
```

### Сертификат не создается
```bash
# Установите OpenSSL
sudo apt install openssl  # Ubuntu/Debian
sudo yum install openssl  # CentOS/RHEL
```

## 🔄 Обновление перехватчика

В `yandex_interceptor.js` измените:
```javascript
const SERVER_URL = `https://YOUR_IP/receive_data`;
const TEST_URL = `https://YOUR_IP/test`;
```

## 📊 Проверка работы

1. **HTTP тест**: `curl http://YOUR_IP:80/test`
2. **HTTPS тест**: `curl -k https://YOUR_IP:443/test`
3. **В браузере**: `https://YOUR_IP:443`

## 🎯 Результат

После настройки HTTPS:
- ✅ CSP не будет блокировать запросы
- ✅ Mixed Content ошибки исчезнут
- ✅ Парсер будет работать с Яндекс Картами 