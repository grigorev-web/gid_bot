const logger = require('../../../shared/logger/logger');

// Импортируем все callback обработчики
const WhereEatCallback = require('./where-eat.callback');
const EventsCallback = require('./events.callback');
const AttractionsCallback = require('./attractions.callback');
const EntertainmentCallback = require('./entertainment.callback');

class CallbackManager {
    constructor() {
        this.callbacks = new Map();
        this.init();
    }

    init() {
        try {
            // Регистрируем все callback'и
            this.registerCallback('where_eat', new WhereEatCallback());
            this.registerCallback('events', new EventsCallback());
            this.registerCallback('attractions', new AttractionsCallback());
            this.registerCallback('entertainment', new EntertainmentCallback());

            logger.info('✅ Callback менеджер инициализирован');
        } catch (error) {
            logger.error(`Ошибка инициализации callback менеджера: ${error.message}`);
        }
    }

    registerCallback(callbackData, handler) {
        this.callbacks.set(callbackData, handler);
        logger.info(`📝 Зарегистрирован callback: ${callbackData}`);
    }

    async handleCallback(callbackQuery, bot) {
        try {
            const data = callbackQuery.data;
            logger.info(`Получен callback: ${data} от пользователя ${callbackQuery.from.id}`);

            // Ищем обработчик для данного callback'а
            const handler = this.callbacks.get(data);
            
            if (handler) {
                logger.info(`Выполняю обработчик для callback: ${data}`);
                await handler.handle(callbackQuery, bot);
            } else {
                logger.warn(`Не найден обработчик для callback: ${data}`);
                
                // Отправляем уведомление о неизвестном callback'е
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: `Вы нажали: ${data}`,
                    show_alert: false
                });
            }

        } catch (error) {
            logger.error(`Ошибка обработки callback: ${error.message}`);
            
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

    // Метод для добавления новых callback'ов динамически
    addCallback(callbackData, handler) {
        this.registerCallback(callbackData, handler);
    }

    // Метод для получения списка всех зарегистрированных callback'ов
    getRegisteredCallbacks() {
        return Array.from(this.callbacks.keys());
    }

    async cleanup() {
        try {
            this.callbacks.clear();
            logger.info('✅ Callback менеджер очищен');
        } catch (error) {
            logger.error(`Ошибка очистки callback менеджера: ${error.message}`);
        }
    }
}

module.exports = CallbackManager; 