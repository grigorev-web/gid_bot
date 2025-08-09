const logger = require('../../../shared/logger/logger');

class EntertainmentCallback {
    async handle(callbackQuery, bot) {
        try {
            logger.info('Обрабатываю callback entertainment (Развлечения)');
            
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '🎉 Развлечения в Нижнем Новгороде',
                show_alert: false
            });

        } catch (error) {
            logger.error(`Ошибка обработки entertainment callback: ${error.message}`);
            throw error;
        }
    }
}

module.exports = EntertainmentCallback; 