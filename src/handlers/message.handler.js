const logger = require('../../logger');

class MessageHandler {
    constructor(gigaChatService) {
        this.gigaChatService = gigaChatService;
    }

    // Обработка команды /start
    async handleStart(msg, bot) {
        const chatId = msg.chat.id;
        const userName = msg.from.first_name;
        
        logger.start(userName);
        
        const welcomeMessage = `Привет, ${userName}! 👋\n\nЯ умный Telegram бот с интеграцией GigaChat AI.\n\nДоступные команды:\n/help - показать справку\n/settings - настройки бота\n\nПросто напишите мне что-нибудь, и я отвечу с помощью ИИ! ��`;
        
        // Отправляем сообщение с очищенной клавиатурой
        bot.sendMessage(chatId, welcomeMessage, {
            reply_markup: {
                remove_keyboard: true
            }
        });
    }

    // Обработка команды /help
    async handleHelp(msg, bot) {
        const chatId = msg.chat.id;
        
        const helpMessage = `📚 Справка по командам:\n\n` +
            `/start - запустить бота\n` +
            `/help - показать эту справку\n` +
            `/settings - настройки бота\n\n` +
            `💡 Просто напишите мне любое сообщение, и я отвечу с помощью ИИ!`;
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🚀 Запустить бота', callback_data: 'start_bot' },
                    { text: 'ℹ️ О боте', callback_data: 'about_bot' }
                ],
                [
                    { text: '🛠️ Настройки', callback_data: 'settings' }
                ]
            ]
        };
        
        bot.sendMessage(chatId, helpMessage, {
            reply_markup: keyboard
        });
    }

    // Обработка команды /settings
    async handleSettings(msg, bot) {
        const chatId = msg.chat.id;
        
        const settingsMessage = `⚙️ Настройки бота:\n\n` +
            `🔧 Архитектура: Модульная\n` +
            `📁 Структура: src/modules/\n` +
            `🤖 ИИ: GigaChat API\n` +
            `📊 Режим: Поллинг\n\n` +
            `Настройки можно изменить в файле config.js`;
        
        bot.sendMessage(chatId, settingsMessage);
    }

    // Обработка обычных сообщений
    async handleRegularMessage(msg, bot) {
        const chatId = msg.chat.id;
        const text = msg.text;
        const userName = msg.from.first_name;
        
        logger.message(userName, text);
        
        // Отправляем индикатор набора текста
        bot.sendChatAction(chatId, 'typing');
        
        try {
            // Отправляем сообщение в GigaChat
            const aiResponse = await this.gigaChatService.sendMessage(text, userName);
            
            // Отправляем ответ от ИИ
            bot.sendMessage(chatId, `🤖 **Ответ ИИ:**\n\n${aiResponse}`);
            
        } catch (error) {
            console.error('❌ Ошибка GigaChat:', error.message);
            
            // Отправляем сообщение об ошибке
            const errorMessage = `❌ Извините, произошла ошибка при обработке вашего сообщения:\n\n${error.message}\n\nПопробуйте позже или обратитесь к администратору.`;
            bot.sendMessage(chatId, errorMessage);
        }
    }
}

module.exports = MessageHandler; 