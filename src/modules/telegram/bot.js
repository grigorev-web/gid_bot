const TelegramBot = require('node-telegram-bot-api');
const config = require('../../../../config');
const telegramConfig = require('./config');
const logger = require('../../../logger');

// Импорт обработчиков
const MessageHandler = require('./handlers/message.handler');
const CallbackHandler = require('./handlers/callback.handler');

class TelegramBotModule {
    constructor(gigaChatService) {
        this.gigaChatService = gigaChatService;
        this.bot = null;
        this.messageHandler = new MessageHandler(gigaChatService);
        this.callbackHandler = new CallbackHandler(gigaChatService);
    }

    // Инициализация бота
    init() {
        this.bot = new TelegramBot(config.BOT_TOKEN, { 
            polling: true,
            request: {
                timeout: telegramConfig.REQUEST_TIMEOUT,
                debug: telegramConfig.DEBUG_MODE
            }
        });

        this.setupEventHandlers();
        return this.bot;
    }

    // Настройка обработчиков событий
    setupEventHandlers() {
        // Обработчик всех сообщений
        this.bot.on('message', async (msg) => {
            await this.handleMessage(msg);
        });

        // Обработчик callback запросов
        this.bot.on('callback_query', async (callbackQuery) => {
            await this.callbackHandler.handleCallback(callbackQuery, this.bot);
        });

        // Обработчик ошибок
        this.bot.on('error', (error) => {
            logger.error(`Критическая ошибка Telegram бота: ${error.message}`);
        });

        // Обработчик ошибок поллинга
        this.bot.on('polling_error', (error) => {
            if (error.code !== 'ECONNRESET' && error.code !== 'ETIMEDOUT') {
                logger.error(`Ошибка поллинга Telegram: ${error.message}`);
            }
        });

        // Обработчик успешного запуска
        this.bot.on('polling_start', () => {
            console.log('📱 Telegram бот запущен и готов к работе!');
        });
    }

    // Обработка сообщений
    async handleMessage(msg) {
        const text = msg.text;
        
        if (!text) return;
        
        // Обработка команд
        if (text === telegramConfig.COMMANDS.START) {
            await this.messageHandler.handleStart(msg, this.bot);
            return;
        }
        
        if (text === telegramConfig.COMMANDS.HELP) {
            await this.messageHandler.handleHelp(msg, this.bot);
            return;
        }
        
        if (text.startsWith(telegramConfig.COMMANDS.ECHO + ' ')) {
            await this.messageHandler.handleEcho(msg, this.bot);
            return;
        }
        
        if (text === telegramConfig.COMMANDS.AI_STATUS) {
            await this.messageHandler.handleAiStatus(msg, this.bot);
            return;
        }
        
        // Обработка обычных сообщений
        if (!text.startsWith('/')) {
            await this.messageHandler.handleRegularMessage(msg, this.bot);
        }
    }

    // Остановка бота
    stop() {
        if (this.bot) {
            this.bot.stopPolling();
            console.log('📱 Telegram бот остановлен');
        }
    }
}

module.exports = TelegramBotModule; 