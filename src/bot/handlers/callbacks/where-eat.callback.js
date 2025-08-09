const logger = require('../../../shared/logger/logger');
const fs = require('fs');

class WhereEatCallback {
    async handle(callbackQuery, bot) {
        try {
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;

            logger.info('Обрабатываю callback where_eat');
            
            const whereEatMessage = `
🍽️ Где поесть в Нижнем Новгороде?

У нас есть множество отличных мест для вкусного обеда или ужина:
• Рестораны с панорамным видом на Волгу
• Уютные кафе в историческом центре
• Стильные бары и пабы
• Традиционные русские рестораны

Выберите, что вас интересует больше всего!
            `;

            try {
                logger.info('Отправляю фото where_eat.jpeg');
                
                await bot.sendPhoto(chatId, fs.createReadStream('./static/images/where_eat.jpeg'), {
                    caption: whereEatMessage,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🍕 Пицца и паста',
                                    callback_data: 'food_pizza'
                                },
                                {
                                    text: '🥩 Стейки и мясо',
                                    callback_data: 'food_steak'
                                }
                            ]
                        ]
                    }
                });

                logger.info('Фото успешно отправлено');

                // Убираем клавиатуру с предыдущего сообщения
                await bot.editMessageReplyMarkup({
                    inline_keyboard: []
                }, {
                    chat_id: chatId,
                    message_id: messageId
                });

                logger.info('Клавиатура предыдущего сообщения убрана');

            } catch (photoError) {
                logger.error(`Ошибка отправки фото: ${photoError.message}`);
                
                // Если не удалось отправить фото, отправляем текстовое сообщение
                await bot.sendMessage(chatId, whereEatMessage, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🍕 Пицца и паста',
                                    callback_data: 'food_pizza'
                                },
                                {
                                    text: '🥩 Стейки и мясо',
                                    callback_data: 'food_steak'
                                }
                            ]
                        ]
                    }
                });
            }

        } catch (error) {
            logger.error(`Ошибка обработки where_eat callback: ${error.message}`);
            throw error;
        }
    }
}

module.exports = WhereEatCallback; 