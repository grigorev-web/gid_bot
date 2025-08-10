#!/bin/bash

echo "🔐 Создание SSL сертификата для Яндекс Парсера..."

# Создаем папку ssl если её нет
if [ ! -d "ssl" ]; then
    mkdir ssl
    echo "✅ Создана папка ssl/"
fi

# Проверяем, есть ли уже сертификаты
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo "⚠️  SSL сертификаты уже существуют"
    echo "📁 Папка: ssl/"
    echo "🔑 Ключ: ssl/key.pem"
    echo "📜 Сертификат: ssl/cert.pem"
    echo ""
    echo "Для пересоздания удалите существующие файлы:"
    echo "rm ssl/cert.pem ssl/key.pem"
    exit 0
fi

# Получаем IP адрес сервера
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo "🌐 IP адрес сервера: $SERVER_IP"
echo "🔧 Создание самоподписанного сертификата..."

# Создаем самоподписанный сертификат
openssl req -x509 -newkey rsa:4096 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -days 365 \
    -nodes \
    -subj "/C=RU/ST=State/L=City/O=YandexParser/CN=$SERVER_IP" \
    -addext "subjectAltName=IP:$SERVER_IP,DNS:$SERVER_IP,DNS:localhost"

if [ $? -eq 0 ]; then
    echo "✅ SSL сертификат успешно создан!"
    echo ""
    echo "📁 Файлы созданы в папке ssl/:"
    echo "🔑 Приватный ключ: ssl/key.pem"
    echo "📜 Сертификат: ssl/cert.pem"
    echo ""
    echo "🚀 Теперь запустите сервер:"
    echo "npm start"
    echo ""
    echo "🔒 HTTPS будет доступен по адресу:"
    echo "https://$SERVER_IP:443"
    echo ""
    echo "⚠️  Внимание: Это самоподписанный сертификат!"
    echo "   Браузер покажет предупреждение о безопасности"
    echo "   Для продакшена используйте Let's Encrypt"
else
    echo "❌ Ошибка создания SSL сертификата"
    echo "🔧 Проверьте, установлен ли OpenSSL:"
    echo "   sudo apt install openssl  # Ubuntu/Debian"
    echo "   sudo yum install openssl  # CentOS/RHEL"
    exit 1
fi 