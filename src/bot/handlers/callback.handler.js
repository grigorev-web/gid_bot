const logger = require('../../shared/logger/logger');
const User = require('../../database/models/User');

class CallbackHandler {
    constructor(gigaChatService) {
        this.gigaChatService = gigaChatService;
        this.userModel = new User();
    }

    async handleCallback(callbackQuery, bot) {
        try {
            const data = callbackQuery.data;
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;

            logger.info(`Получен callback: ${data} от пользователя ${callbackQuery.from.id}`);

            // Обработка других callback'ов (если есть)
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Неизвестная команда'
            });
        } catch (error) {
            logger.error(`Ошибка обработки callback: ${error.message}`);
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Произошла ошибка'
            });
        }
    }

    async handleStatsCallback(data, chatId, messageId, bot) {
        try {
            const action = data.split('_')[1];
            
            switch (action) {
                case 'detailed':
                    await this.showDetailedStats(chatId, messageId, bot);
                    break;
                case 'global':
                    await this.showGlobalStats(chatId, messageId, bot);
                    break;
                case 'back':
                    await this.showMainStats(chatId, messageId, bot);
                    break;
                default:
                    await this.showMainStats(chatId, messageId, bot);
            }
        } catch (error) {
            logger.error(`Ошибка обработки stats callback: ${error.message}`);
            await bot.editMessageText('❌ Ошибка при получении статистики', {
                chat_id: chatId,
                message_id: messageId
            });
        }
    }

    async handleSettingsCallback(data, chatId, messageId, bot) {
        try {
            const action = data.split('_')[1];
            
            switch (action) {
                case 'language':
                    await this.showLanguageSettings(chatId, messageId, bot);
                    break;
                case 'notifications':
                    await this.toggleNotifications(chatId, messageId, bot);
                    break;
                case 'back':
                    await this.showMainSettings(chatId, messageId, bot);
                    break;
                default:
                    await this.showMainSettings(chatId, messageId, bot);
            }
        } catch (error) {
            logger.error(`Ошибка обработки settings callback: ${error.message}`);
            await bot.editMessageText('❌ Ошибка при изменении настроек', {
                chat_id: chatId,
                message_id: messageId
            });
        }
    }

    async handleAiCallback(data, chatId, messageId, bot) {
        try {
            const action = data.split('_')[1];
            
            switch (action) {
                case 'status':
                    await this.showAiStatus(chatId, messageId, bot);
                    break;
                case 'models':
                    await this.showAiModels(chatId, messageId, bot);
                    break;
                case 'back':
                    await this.showAiMain(chatId, messageId, bot);
                    break;
                default:
                    await this.showAiMain(chatId, messageId, bot);
            }
        } catch (error) {
            logger.error(`Ошибка обработки AI callback: ${error.message}`);
            await bot.editMessageText('❌ Ошибка при получении информации об AI', {
                chat_id: chatId,
                message_id: messageId
            });
        }
    }

    async handleHelpCallback(chatId, messageId, bot) {
        const helpText = `
📚 *Справка по использованию бота*

*Основные команды:*
• /start - Запуск бота
• /help - Эта справка
• /ai_status - Проверка статуса AI
• /stats - Ваша статистика использования
• /settings - Настройки бота

*Как использовать:*
Просто отправьте мне любое текстовое сообщение, и я отвечу вам с помощью GigaChat AI.

*Поддерживаемые типы сообщений:*
• Текст
• Фото (с подписью)
• Документы (с описанием)

*Ограничения:*
• Максимальная длина ответа: 1000 символов
• Время ожидания: до 30 секунд
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
            ]
        };

        await bot.editMessageText(helpText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async handleUnknownCallback(chatId, messageId, bot) {
        await bot.editMessageText('❌ Неизвестная команда', {
            chat_id: chatId,
            message_id: messageId
        });
    }

    async showMainStats(chatId, messageId, bot) {
        const statsText = `
📊 *Статистика*

Выберите тип статистики для просмотра:
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '📈 Детальная статистика', callback_data: 'stats_detailed' }],
                [{ text: '🌍 Глобальная статистика', callback_data: 'stats_global' }],
                [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
            ]
        };

        await bot.editMessageText(statsText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async showDetailedStats(chatId, messageId, bot) {
        // Здесь можно добавить логику для получения детальной статистики
        const statsText = `
📈 *Детальная статистика*

*Функция в разработке*

В будущих версиях здесь будет отображаться детальная статистика использования бота.
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '🔙 Назад к статистике', callback_data: 'stats_back' }]
            ]
        };

        await bot.editMessageText(statsText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async showGlobalStats(chatId, messageId, bot) {
        // Здесь можно добавить логику для получения глобальной статистики
        const statsText = `
🌍 *Глобальная статистика*

*Функция в разработке*

В будущих версиях здесь будет отображаться глобальная статистика использования бота.
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '🔙 Назад к статистике', callback_data: 'stats_back' }]
            ]
        };

        await bot.editMessageText(statsText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async showMainSettings(chatId, messageId, bot) {
        const settingsText = `
⚙️ *Настройки*

Выберите настройку для изменения:
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '🌐 Язык', callback_data: 'settings_language' }],
                [{ text: '🔔 Уведомления', callback_data: 'settings_notifications' }],
                [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
            ]
        };

        await bot.editMessageText(settingsText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async showLanguageSettings(chatId, messageId, bot) {
        const languageText = `
🌐 *Настройки языка*

Выберите язык интерфейса:
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '🇷🇺 Русский', callback_data: 'language_ru' }],
                [{ text: '🇺🇸 English', callback_data: 'language_en' }],
                [{ text: '🔙 Назад к настройкам', callback_data: 'settings_back' }]
            ]
        };

        await bot.editMessageText(languageText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async toggleNotifications(chatId, messageId, bot) {
        const notificationText = `
🔔 *Настройки уведомлений*

Функция в разработке.

В будущих версиях здесь можно будет настроить уведомления.
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '🔙 Назад к настройкам', callback_data: 'settings_back' }]
            ]
        };

        await bot.editMessageText(notificationText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async showAiMain(chatId, messageId, bot) {
        const aiText = `
🤖 *AI настройки*

Выберите действие:
        `;

        const keyboard = {
            inline_keyboard: [
                [{ text: '📊 Статус AI', callback_data: 'ai_status' }],
                [{ text: '📋 Доступные модели', callback_data: 'ai_models' }],
                [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
            ]
        };

        await bot.editMessageText(aiText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async showAiStatus(chatId, messageId, bot) {
        try {
            const status = await this.gigaChatService.checkStatus();
            
            let statusText = '';
            if (status.available) {
                statusText = `
✅ *Статус GigaChat*

*Статус:* Работает
*Модели:* ${status.models.length} доступно
*Последняя проверка:* ${new Date().toLocaleString('ru-RU')}
                `;
            } else {
                statusText = `
❌ *Статус GigaChat*

*Ошибка:* ${status.error}
*Статус:* Не работает
*Последняя проверка:* ${new Date().toLocaleString('ru-RU')}
                `;
            }

            const keyboard = {
                inline_keyboard: [
                    [{ text: '🔄 Обновить', callback_data: 'ai_status' }],
                    [{ text: '🔙 Назад к AI', callback_data: 'ai_back' }]
                ]
            };

            await bot.editMessageText(statusText, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            logger.error(`Ошибка получения статуса AI: ${error.message}`);
            await bot.editMessageText('❌ Ошибка при получении статуса AI', {
                chat_id: chatId,
                message_id: messageId
            });
        }
    }

    async showAiModels(chatId, messageId, bot) {
        try {
            const models = await this.gigaChatService.getModels();
            const modelsList = models.data?.map(model => `• ${model.id}`).join('\n') || 'Нет доступных моделей';
            
            const modelsText = `
📋 *Доступные модели GigaChat*

${modelsList}

*Всего моделей:* ${models.data?.length || 0}
            `;

            const keyboard = {
                inline_keyboard: [
                    [{ text: '🔄 Обновить', callback_data: 'ai_models' }],
                    [{ text: '🔙 Назад к AI', callback_data: 'ai_back' }]
                ]
            };

            await bot.editMessageText(modelsText, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            logger.error(`Ошибка получения моделей AI: ${error.message}`);
            await bot.editMessageText('❌ Ошибка при получении списка моделей', {
                chat_id: chatId,
                message_id: messageId
            });
        }
    }

    async cleanup() {
        try {
            await this.userModel.close();
            logger.info('✅ Обработчик callback очищен');
        } catch (error) {
            logger.error(`Ошибка очистки обработчика callback: ${error.message}`);
        }
    }
}

module.exports = CallbackHandler;