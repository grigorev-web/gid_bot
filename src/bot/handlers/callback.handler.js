const logger = require('../../shared/logger/logger');

class CallbackHandler {
    constructor(gigaChatService) {
        this.gigaChatService = gigaChatService;
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
            const data = callbackQuery.data;
            logger.info(`Получен callback: ${data} от пользователя ${callbackQuery.from.id}`);

            // В данный момент inline меню не используется
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Функция временно недоступна'
            });
        } catch (error) {
            logger.error(`Ошибка обработки callback: ${error.message}`);
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Произошла ошибка'
            });
        }
    }

    async cleanup() {
        try {
            logger.info('✅ Callback обработчик очищен');
        } catch (error) {
            logger.error(`Ошибка очистки callback обработчика: ${error.message}`);
        }
    }
}

module.exports = CallbackHandler;