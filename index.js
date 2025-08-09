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
        
        // Логируем запуск бота
        logger.botStart();
        
    } catch (error) {
        console.error('❌ Ошибка запуска бота:', error.message);
        logger.errorOccurred(error, { context: 'main' });
        process.exit(1);
    }
}

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
    console.error('❌ Необработанная ошибка:', error.message);
    logger.errorOccurred(error, { context: 'uncaughtException' });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Необработанное отклонение промиса:', reason);
    logger.errorOccurred(new Error(String(reason)), { context: 'unhandledRejection' });
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
    logger.botStop('SIGINT');
    
    if (global.botInstance) {
        try {
            await global.botInstance.stop();
        } catch (error) {
            logger.errorOccurred(error, { context: 'shutdown' });
        }
    }
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
    logger.botStop('SIGTERM');
    
    if (global.botInstance) {
        try {
            await global.botInstance.stop();
        } catch (error) {
            logger.errorOccurred(error, { context: 'shutdown' });
        }
    }
    
    process.exit(0);
});

// Запуск приложения
main(); 