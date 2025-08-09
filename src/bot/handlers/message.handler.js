const logger = require('../../shared/logger/logger');
const User = require('../../database/models/User');
const Message = require('../../database/models/Message');
const fs = require('fs');

class MessageHandler {
    constructor(gigaChatService) {
        this.gigaChatService = gigaChatService;
        this.userModel = new User();
        this.messageModel = new Message();
        this.init();
    }

    async init() {
        try {
            await this.userModel.init();
            await this.messageModel.init();
            logger.info('✅ Обработчик сообщений инициализирован');
        } catch (error) {
            logger.error(`Ошибка инициализации обработчика сообщений: ${error.message}`);
        }
    }

    async handleStart(msg, bot) {
        try {
            const user = msg.from;
            const chat = msg.chat;

            // Сохраняем/обновляем пользователя в БД
            await this.userModel.createOrUpdate(user);
            await this.userModel.updateLastActivity(user.id);

            const welcomeMessage = `
👩 Добро пожаловать в гид бот по Нижнему Новгороду!

У меня есть информация о всех достопримечательностях, кафе и ресторанах, а также о всех событиях, которые проходят в городе.

Просто напишите мне сообщение, и я отвечу вам!
            `;

            // Отправляем сообщение с картинкой и тестовыми кнопками
            try {
                logger.info('Отправляю фото start_logo4.jpg');
                
                await bot.sendPhoto(chat.id, fs.createReadStream('./static/images/start_logo4.jpg'), {
                    caption: welcomeMessage,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🎟️ Афиша',
                                    callback_data: 'events'
                                }
                            ],
                            [
                                {
                                    text: '👨‍🍳 Где поесть?',
                                    callback_data: 'where_eat'
                                }
                            ],
                            [
                                {
                                    text: '🌉 Куда сходить?',
                                    callback_data: 'attractions'
                                }
                            ],
                            [
                                {
                                    text: '🎉 Развлечения',
                                    callback_data: 'entertainment'
                                }
                            ]
                        ]
                    }
                });
                
                logger.info('Приветственное фото успешно отправлено');
                
            } catch (photoError) {
                logger.error(`Ошибка отправки приветственного фото: ${photoError.message}`);
                
                // Если не удалось отправить фото, отправляем текстовое сообщение
                await bot.sendMessage(chat.id, welcomeMessage, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🎟️ Афиша',
                                    callback_data: 'events'
                                }
                            ],
                            [
                                {
                                    text: '👨‍🍳 Где поесть?',
                                    callback_data: 'where_eat'
                                }
                            ],
                            [
                                {
                                    text: '🌉 Куда сходить?',
                                    callback_data: 'attractions'
                                }
                            ],
                            [
                                {
                                    text: '🎉 Развлечения',
                                    callback_data: 'entertainment'
                                }
                            ]
                        ]
                    }
                });
                
                logger.info('Отправлено текстовое приветственное сообщение');
            }
            
            logger.info(`${user.first_name} ${user.username} ${user.id} запустил бота`);
        } catch (error) {
            logger.error(`Ошибка обработки команды /start: ${error.message}`);
            await bot.sendMessage(msg.chat.id, 'Произошла ошибка при запуске бота. Попробуйте позже.');
        }
    }

    async handleHelp(msg, bot) {
        try {
            const helpMessage = `
📚 Справка по использованию бота

Основные команды:
• /start - Запуск бота
• /help - Эта справка
• /settings - Настройки бота

Как использовать:
Просто отправьте мне любое текстовое сообщение, и я отвечу вам с помощью GigaChat AI.

Поддерживаемые типы сообщений:
• Текст
• Фото (с подписью)
• Документы (с описанием)

Ограничения:
• Максимальная длина ответа: 1000 символов
• Время ожидания: до 30 секунд
            `;

            await bot.sendMessage(msg.chat.id, helpMessage);
        } catch (error) {
            logger.error(`Ошибка обработки команды /help: ${error.message}`);
            await bot.sendMessage(msg.chat.id, 'Произошла ошибка при отображении справки.');
        }
    }

    async handleSettings(msg, bot) {
        try {
            const user = msg.from;
            const settings = await this.userModel.getSettings(user.id) || {};

            const settingsText = `
⚙️ Настройки

Текущие настройки:
• Язык: ${settings.language || 'ru'}
• Уведомления: ${settings.notifications !== false ? 'Включены' : 'Отключены'}
• Автосохранение: ${settings.autoSave !== false ? 'Включено' : 'Отключено'}

Для изменения настроек используйте команды:
• /set_language - Изменить язык
• /toggle_notifications - Включить/выключить уведомления
            `;

            await bot.sendMessage(msg.chat.id, settingsText);
        } catch (error) {
            logger.error(`Ошибка получения настроек: ${error.message}`);
            await bot.sendMessage(msg.chat.id, '❌ Ошибка при получении настроек');
        }
    }
    async handleUnknownCommand(msg, bot) {
        await bot.sendMessage(msg.chat.id, '❌ Неизвестная команда');
    }
    
    async handleRegularMessage(msg, bot) {
        try {
            const user = msg.from;
            const chat = msg.chat;
            const messageText = msg.text || msg.caption || '';

            // Сначала создаем/обновляем пользователя в БД
            await this.userModel.createOrUpdate(user);
            await this.userModel.updateLastActivity(user.id);
            await this.userModel.incrementMessageCount(user.id);

            // Затем сохраняем входящее сообщение
            await this.messageModel.saveMessage(msg);

            // Показываем индикатор набора
            const typingMsg = await bot.sendMessage(chat.id, '🤖 AI думает...');

            try {
                // Получаем контекст предыдущих сообщений
                const messageHistory = await this.messageModel.getMessageHistory(user.id, 10);
                
                // Формируем контекст в хронологическом порядке
                const context = [];
                const recentMessages = messageHistory.slice(-6); // Последние 6 сообщений
                
                for (const msg of recentMessages) {
                    context.push({
                        role: msg.is_ai_response ? 'assistant' : 'user',
                        content: msg.content
                    });
                }

                // Отправляем запрос к GigaChat
                const aiResponse = await this.gigaChatService.sendMessage(
                    messageText,
                    user.first_name || user.username || 'Пользователь',
                    context
                );

                // Увеличиваем счетчик AI запросов
                await this.userModel.incrementAiRequestsCount(user.id);

                // Сохраняем AI ответ
                const aiMessageData = {
                    ...msg,
                    text: aiResponse.content,
                    message_id: Date.now(), // Временный ID
                    from: { id: user.id, is_bot: true, first_name: 'AI Assistant' }
                };
                await this.messageModel.saveMessage(aiMessageData, true, {
                    model: aiResponse.model,
                    tokens_used: aiResponse.tokens_used,
                    response_time_ms: aiResponse.response_time_ms
                });

                // Отправляем ответ пользователю
                await bot.editMessageText(aiResponse.content, {
                    chat_id: chat.id,
                    message_id: typingMsg.message_id
                });

                logger.info(`AI ответ отправлен пользователю ${user.id}`);
            } catch (error) {
                logger.error(`Ошибка получения ответа от AI: ${error.message}`);
                await bot.editMessageText(
                    '❌ Извините, произошла ошибка при обработке вашего запроса. Попробуйте позже.',
                    {
                        chat_id: chat.id,
                        message_id: typingMsg.message_id
                    }
                );
            }
        } catch (error) {
            logger.error(`Ошибка обработки обычного сообщения: ${error.message}`);
            await bot.sendMessage(msg.chat.id, '❌ Произошла ошибка при обработке сообщения');
        }
    }

    async cleanup() {
        try {
            await this.userModel.close();
            await this.messageModel.close();
            logger.info('✅ Обработчик сообщений очищен');
        } catch (error) {
            logger.error(`Ошибка очистки обработчика сообщений: ${error.message}`);
        }
    }
}

module.exports = MessageHandler; 