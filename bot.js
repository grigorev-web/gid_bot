// Глобальная настройка для игнорирования SSL ошибок (для GigaChat API)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const TelegramBot = require('node-telegram-bot-api');
const config = require('./../config');
const logger = require('./logger');

// Импорт сервисов и обработчиков
const GigaChatService = require('./src/services/gigachat.service');
const MessageHandler = require('./src/handlers/message.handler');
const CallbackHandler = require('./src/handlers/callback.handler');
const { logUserAndChatInfo } = require('./src/utils/logging.util');

// Создаем экземпляр бота с отключенными лишними логами
const bot = new TelegramBot(config.BOT_TOKEN, { 
    polling: true,
    request: {
        timeout: 30000,
        debug: false
    }
});

// Инициализация сервисов
const gigaChatService = new GigaChatService();
const messageHandler = new MessageHandler(gigaChatService);
const callbackHandler = new CallbackHandler(gigaChatService);

// Обработчик всех сообщений
bot.on('message', async (msg) => {
    const text = msg.text;
    
    // Подробное логирование информации
    //logUserAndChatInfo(msg);
    
    if (!text) return;
    
    // Обработка команд
    if (text === '/start') {
        await messageHandler.handleStart(msg, bot);
        return;
    }
    
    if (text === '/help') {
        await messageHandler.handleHelp(msg, bot);
        return;
    }
    
    if (text.startsWith('/echo ')) {
        await messageHandler.handleEcho(msg, bot);
        return;
    }
    
    if (text === '/ai_status') {
        await messageHandler.handleAiStatus(msg, bot);
        return;
    }
    
    // Обработка обычных сообщений
    if (!text.startsWith('/')) {
        await messageHandler.handleRegularMessage(msg, bot);
    }
});

// Обработчик callback запросов (нажатия на кнопки)
bot.on('callback_query', async (callbackQuery) => {
    await callbackHandler.handleCallback(callbackQuery, bot);
});

// Обработчик ошибок (только критические)
bot.on('error', (error) => {
    logger.error(`Критическая ошибка бота: ${error.message}`);
});

// Обработчик ошибок поллинга (только критические)
bot.on('polling_error', (error) => {
    if (error.code !== 'ECONNRESET' && error.code !== 'ETIMEDOUT') {
        logger.error(`Ошибка поллинга: ${error.message}`);
    }
});

// Обработчик успешного запуска
bot.on('polling_start', () => {
    logger.botStart();
    console.log('🤖 Интеграция с GigaChat готова к работе!');
    console.log('📁 Модульная архитектура загружена');
    console.log('🔒 SSL проверки отключены для GigaChat API');
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.shutdown('SIGINT');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.shutdown('SIGTERM');
    bot.stopPolling();
    process.exit(0);
});

module.exports = bot; 