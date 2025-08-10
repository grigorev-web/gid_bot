const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Создаем папку для логов если её нет
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

// Middleware для парсинга JSON
app.use(express.json({ limit: '50mb' }));

// Статические файлы
app.use(express.static('public'));

// Главная страница
app.get('/', (req, res) => {
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
            </style>
        </head>
        <body>
            <h1>🚀 Сервер для парсинга Яндекс Карт</h1>
            <div class="status">
                <p>✅ Сервер работает на порту ${PORT}</p>
                <p>📝 Отправляйте POST запросы на /receive_data</p>
                <p>📁 Логи сохраняются в папку logs/</p>
                <p>🔍 Проверьте консоль сервера для просмотра полученных данных</p>
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
            timestamp: new Date().toISOString()
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
            memory_usage: process.memoryUsage()
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('🚀 Сервер запущен на http://localhost:' + PORT);
    console.log('📝 Отправляйте POST запросы на http://localhost:' + PORT + '/receive_data');
    console.log('📊 Статистика: http://localhost:' + PORT + '/stats');
    console.log('📁 Логи сохраняются в папку logs/');
    console.log('⏹️  Для остановки нажмите Ctrl+C');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Сервер останавливается...');
    process.exit(0);
}); 