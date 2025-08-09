const logger = require('../../../shared/logger/logger');

class EventsCallback {
    async handle(callbackQuery, bot) {
        try {
            logger.info('Обрабатываю callback events (Афиша)');
            
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '🎟️ Афиша событий в Нижнем Новгороде',
                show_alert: false
            });

        } catch (error) {
            logger.error(`Ошибка обработки events callback: ${error.message}`);
            throw error;
        }
    }
}

module.exports = EventsCallback; 