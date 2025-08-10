const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const HOST = process.env.HOST || '0.0.0.0'; // Разрешаем доступ с любого IP

// Создаем папку для логов если её нет
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

// Создаем папку для SSL сертификатов если её нет
if (!fs.existsSync('ssl')) {
    fs.mkdirSync('ssl');
}

// SSL опции (самоподписанный сертификат)
const httpsOptions = {
    key: fs.existsSync('./ssl/key.pem') ? fs.readFileSync('./ssl/key.pem') : null,
    cert: fs.existsSync('./ssl/cert.pem') ? fs.readFileSync('./ssl/cert.pem') : null
};

// Middleware для парсинга JSON
app.use(express.json({ limit: '50mb' }));

// Middleware для CORS (разрешаем запросы с любых доменов)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Статические файлы
app.use(express.static('public'));

// Главная страница
app.get('/', (req, res) => {
    const protocol = req.secure ? 'https' : 'http';
    const port = req.secure ? HTTPS_PORT : PORT;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Яндекс Карты Парсер</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                .status { padding: 10px; background: #e8f5e8; border-radius: 5px; }
                .ip-info { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0; }
                .https-info { background: #e8f4fd; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>🚀 Сервер для парсинга Яндекс Карт</h1>
            <div class="status">
                <p>✅ Сервер работает на порту ${port}</p>
                <p>🔒 Протокол: ${protocol.toUpperCase()}</p>
                <p>📝 Отправляйте POST запросы на /receive_data</p>
                <p>📁 Логи сохраняются в папку logs/</p>
                <p>🔍 Проверьте консоль сервера для просмотра полученных данных</p>
            </div>
            <div class="https-info">
                <p><strong>HTTPS URL:</strong> https://${req.headers.host || HOST}/receive_data</p>
                <p><strong>HTTP URL:</strong> http://${req.headers.host || HOST}:${PORT}/receive_data</p>
            </div>
            <div class="ip-info">
                <p><strong>IP адрес сервера:</strong> ${req.connection.remoteAddress || req.ip || 'Неизвестно'}</p>
                <p><strong>User-Agent:</strong> ${req.headers['user-agent'] || 'Неизвестно'}</p>
            </div>
        </body>
        </html>
    `);
});

// Эндпоинт для приема данных
app.post('/receive_data', (req, res) => {
    try {
        const data = req.body;
        
        // Создаем timestamp для имени файла
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFile = `logs/yandex_data_${timestamp}.json`;
        
        // Сохраняем данные в файл
        fs.writeFileSync(logFile, JSON.stringify(data, null, 2), 'utf8');
        
        // Выводим в консоль для отладки
        console.log('\n' + '='.repeat(60));
        console.log(`🆕 НОВЫЕ ДАННЫЕ ПОЛУЧЕНЫ ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));
        console.log('IP клиента:', req.ip || req.connection.remoteAddress);
        console.log('URL:', data.url);
        console.log('Метод:', data.method);
        console.log('Время:', data.timestamp);
        console.log('Размер ответа:', data.response ? data.response.length : 0, 'символов');
        console.log('Файл лога:', logFile);
        console.log('='.repeat(60));
        
        // Если ответ слишком длинный, показываем только начало
        if (data.response && data.response.length > 200) {
            console.log('Начало ответа:', data.response.substring(0, 200) + '...');
        } else if (data.response) {
            console.log('Ответ:', data.response);
        }
        console.log('='.repeat(60) + '\n');
        
        res.json({
            status: 'success',
            message: 'Данные получены',
            log_file: logFile,
            timestamp: new Date().toISOString(),
            server_ip: req.connection.localAddress,
            client_ip: req.ip || req.connection.remoteAddress
        });
        
    } catch (error) {
        console.error('❌ Ошибка обработки данных:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Статистика
app.get('/stats', (req, res) => {
    try {
        const logsDir = path.join(__dirname, 'logs');
        const files = fs.readdirSync(logsDir);
        const stats = {
            total_files: files.length,
            files: files.slice(-10), // Последние 10 файлов
            server_uptime: process.uptime(),
            memory_usage: process.memoryUsage(),
            server_ip: req.connection.localAddress,
            client_ip: req.ip || req.connection.remoteAddress
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Тестовый эндпоинт для проверки работы
app.get('/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'Сервер работает!',
        timestamp: new Date().toISOString(),
        server_ip: req.connection.localAddress,
        client_ip: req.ip || req.connection.remoteAddress,
        headers: req.headers
    });
});

// Запуск HTTP сервера
app.listen(PORT, HOST, () => {
    console.log('🚀 HTTP сервер запущен на http://' + HOST + ':' + PORT);
    console.log('📝 Отправляйте POST запросы на http://' + HOST + ':' + PORT + '/receive_data');
    console.log('📊 Статистика: http://' + HOST + ':' + PORT + '/stats');
    console.log('🧪 Тест: http://' + HOST + ':' + PORT + '/test');
    console.log('📁 Логи сохраняются в папку logs/');
});

// Запуск HTTPS сервера (если есть сертификаты)
if (httpsOptions.key && httpsOptions.cert) {
    https.createServer(httpsOptions, app).listen(HTTPS_PORT, HOST, () => {
        console.log('🔒 HTTPS сервер запущен на https://' + HOST + ':' + HTTPS_PORT);
        console.log('📝 Отправляйте POST запросы на https://' + HOST + ':' + HTTPS_PORT + '/receive_data');
        console.log('📊 Статистика: https://' + HOST + ':' + HTTPS_PORT + '/stats');
        console.log('🧪 Тест: https://' + HOST + ':' + HTTPS_PORT + '/test');
    });
} else {
    console.log('⚠️  HTTPS сервер не запущен - отсутствуют SSL сертификаты');
    console.log('🔧 Создайте сертификаты в папке ssl/ или запустите скрипт создания');
}

console.log('⏹️  Для остановки нажмите Ctrl+C');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Сервер останавливается...');
    process.exit(0);
}); 