const Bot = require('./src/bot/bot');
const logger = require('./src/shared/logger/logger');

async function main() {
    try {
        console.log('🚀 Запуск Telegram бота с GigaChat интеграцией...');
        
        // Создаем экземпляр бота
        const bot = new Bot();
        
        // Сохраняем глобальную ссылку для graceful shutdown
        global.botInstance = bot;
        
        // Запускаем бота
        await bot.start();
        
        console.log('✅ Бот успешно запущен!');
        console.log('📝 Используйте Ctrl+C для остановки');
        
    } catch (error) {
        console.error('❌ Ошибка запуска бота:', error.message);
        logger.error(`Критическая ошибка запуска: ${error.message}`);
        process.exit(1);
    }
}

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
    console.error('❌ Необработанная ошибка:', error.message);
    logger.error(`Необработанная ошибка: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Необработанное отклонение промиса:', reason);
    logger.error(`Необработанное отклонение промиса: ${reason}`);
    process.exit(1);
});

// Запуск приложения
main(); 