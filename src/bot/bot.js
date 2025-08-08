// Глобальная настройка для игнорирования SSL ошибок (для GigaChat API)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const TelegramBot = require('node-telegram-bot-api');
const config = require('../../../config');
const logger = require('../shared/logger/logger');

// Импорт сервисов и обработчиков
const GigaChatService = require('../gigachat/services/gigachat.service');
const MessageHandler = require('./handlers/message.handler');
const CallbackHandler = require('./handlers/callback.handler');

class Bot {
    constructor() {
        this.bot = null;
        this.gigaChatService = null;
        this.messageHandler = null;
        this.callbackHandler = null;
        this.isRunning = false;
    }

    async init() {
        try {
            // Создаем экземпляр бота с отключенными лишними логами
            this.bot = new TelegramBot(config.BOT_TOKEN, { 
                polling: true,
                request: {
                    timeout: 30000,
                    debug: false
                }
            });

            // Инициализация сервисов
            this.gigaChatService = new GigaChatService();
            this.messageHandler = new MessageHandler(this.gigaChatService);
            this.callbackHandler = new CallbackHandler(this.gigaChatService);

            // Настройка обработчиков событий
            this.setupEventHandlers();

            logger.info('✅ Бот инициализирован успешно');
        } catch (error) {
            logger.error(`Ошибка инициализации бота: ${error.message}`);
            throw error;
        }
    }

    setupEventHandlers() {
        // Обработчик всех сообщений
        this.bot.on('message', async (msg) => {
            try {
                await this.handleMessage(msg);
            } catch (error) {
                logger.error(`Ошибка обработки сообщения: ${error.message}`);
            }
        });

        // Обработчик callback запросов (нажатия на кнопки)
        this.bot.on('callback_query', async (callbackQuery) => {
            try {
                await this.callbackHandler.handleCallback(callbackQuery, this.bot);
            } catch (error) {
                logger.error(`Ошибка обработки callback: ${error.message}`);
            }
        });

        // Обработчик ошибок (только критические)
        this.bot.on('error', (error) => {
            logger.error(`Критическая ошибка бота: ${error.message}`);
        });

        // Обработчик ошибок поллинга (только критические)
        this.bot.on('polling_error', (error) => {
            if (error.code !== 'ECONNRESET' && error.code !== 'ETIMEDOUT') {
                logger.error(`Ошибка поллинга: ${error.message}`);
            }
        });

        // Обработчик успешного запуска
        this.bot.on('polling_start', () => {
            this.isRunning = true;
            logger.botStart();
            console.log('🤖 Интеграция с GigaChat готова к работе!');
            console.log('📁 Модульная архитектура загружена');
            console.log('🔒 SSL проверки отключены для GigaChat API');
            console.log('💾 База данных подключена');
        });

        // Обработчик остановки поллинга
        this.bot.on('polling_stop', () => {
            this.isRunning = false;
            logger.info('🛑 Поллинг бота остановлен');
        });
    }

    async handleMessage(msg) {
        const text = msg.text;
        
        if (!text) return;
        
        // Обработка команд
        if (text === '/start') {
            await this.messageHandler.handleStart(msg, this.bot);
            return;
        }
        
        if (text === '/help') {
            await this.messageHandler.handleHelp(msg, this.bot);
            return;
        }
        
        if (text === '/menu') {
            await this.messageHandler.handleMenu(msg, this.bot);
            return;
        }
        
        if (text.startsWith('/echo ')) {
            await this.messageHandler.handleEcho(msg, this.bot);
            return;
        }
        
        if (text === '/ai_status') {
            await this.messageHandler.handleAiStatus(msg, this.bot);
            return;
        }

        if (text === '/stats') {
            await this.messageHandler.handleStats(msg, this.bot);
            return;
        }

        if (text === '/settings') {
            await this.messageHandler.handleSettings(msg, this.bot);
            return;
        }
        
        // Обработка обычных сообщений
        if (!text.startsWith('/')) {
            await this.messageHandler.handleRegularMessage(msg, this.bot);
        }
    }

    async start() {
        try {
            await this.init();
            logger.info('🚀 Бот запущен');
        } catch (error) {
            logger.error(`Ошибка запуска бота: ${error.message}`);
            throw error;
        }
    }

    async stop() {
        try {
            if (this.bot) {
                this.bot.stopPolling();
            }
            
            // Очистка ресурсов
            if (this.messageHandler) {
                await this.messageHandler.cleanup();
            }
            
            if (this.callbackHandler) {
                await this.callbackHandler.cleanup();
            }
            
            if (this.gigaChatService) {
                this.gigaChatService.cleanup();
            }
            
            this.isRunning = false;
            logger.info('🛑 Бот остановлен');
        } catch (error) {
            logger.error(`Ошибка остановки бота: ${error.message}`);
        }
    }

    isBotRunning() {
        return this.isRunning;
    }

    getBotInstance() {
        return this.bot;
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.shutdown('SIGINT');
    if (global.botInstance) {
        await global.botInstance.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.shutdown('SIGTERM');
    if (global.botInstance) {
        await global.botInstance.stop();
    }
    process.exit(0);
});

module.exports = Bot; 