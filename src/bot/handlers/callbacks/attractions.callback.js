const logger = require('../../../shared/logger/logger');

class AttractionsCallback {
    async handle(callbackQuery, bot) {
        try {
            logger.info('Обрабатываю callback attractions (Куда сходить?)');
            
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '🌉 Достопримечательности Нижнего Новгорода',
                show_alert: false
            });

        } catch (error) {
            logger.error(`Ошибка обработки attractions callback: ${error.message}`);
            throw error;
        }
    }
}

module.exports = AttractionsCallback; 