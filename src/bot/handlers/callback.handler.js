const logger = require('../../shared/logger/logger');
const CallbackManager = require('./callbacks/index');

class CallbackHandler {
    constructor(gigaChatService) {
        this.gigaChatService = gigaChatService;
        this.callbackManager = new CallbackManager();
        this.init();
    }

    async init() {
        try {
            logger.info('✅ Callback обработчик инициализирован');
        } catch (error) {
            logger.error(`Ошибка инициализации callback обработчика: ${error.message}`);
        }
    }

    async handleCallback(callbackQuery, bot) {
        try {
            // Делегируем обработку callback'а менеджеру
            await this.callbackManager.handleCallback(callbackQuery, bot);
        } catch (error) {
            logger.error(`Ошибка в CallbackHandler: ${error.message}`);
            
            try {
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '❌ Произошла ошибка при обработке запроса',
                    show_alert: true
                });
            } catch (answerError) {
                logger.error(`Не удалось отправить ответ об ошибке: ${answerError.message}`);
            }
        }
    }

    // Метод для добавления новых callback'ов
    addCallback(callbackData, handler) {
        this.callbackManager.addCallback(callbackData, handler);
    }

    // Метод для получения списка зарегистрированных callback'ов
    getRegisteredCallbacks() {
        return this.callbackManager.getRegisteredCallbacks();
    }

    async cleanup() {
        try {
            await this.callbackManager.cleanup();
            logger.info('✅ Callback обработчик очищен');
        } catch (error) {
            logger.error(`Ошибка очистки callback обработчика: ${error.message}`);
        }
    }
}

module.exports = CallbackHandler;