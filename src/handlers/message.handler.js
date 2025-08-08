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
        
        const welcomeMessage = `Привет, ${userName}! 👋\n\nЯ умный Telegram бот с интеграцией GigaChat AI.\n\nДоступные команды:\n/help - показать справку\n/echo <текст> - повторить текст\n\nПросто напишите мне что-нибудь, и я отвечу с помощью ИИ! 🤖`;
        
        bot.sendMessage(chatId, welcomeMessage);
    }

    // Обработка команды /help
    async handleHelp(msg, bot) {
        const chatId = msg.chat.id;
        
        const helpMessage = `📚 Справка по командам:\n\n` +
            `/start - запустить бота\n` +
            `/help - показать эту справку\n` +
            `/echo <текст> - повторить ваш текст\n` +
            `/ai_status - статус подключения к GigaChat\n\n` +
            `💡 Просто напишите мне любое сообщение, и я отвечу с помощью ИИ!`;
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🚀 Запустить бота', callback_data: 'start_bot' },
                    { text: '🔊 Команда Echo', callback_data: 'echo_info' }
                ],
                [
                    { text: '🤖 Статус ИИ', callback_data: 'ai_status' },
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

    // Обработка команды /echo
    async handleEcho(msg, bot) {
        const chatId = msg.chat.id;
        const text = msg.text;
        const userName = msg.from.first_name;
        
        const echoText = text.substring(6); // Убираем "/echo "
        
        if (echoText) {
            logger.echo(userName, echoText);
            bot.sendMessage(chatId, `🔊 Эхо: ${echoText}`);
        } else {
            bot.sendMessage(chatId, `Использование: /echo <текст>`);
        }
    }

    // Обработка команды /ai_status
    async handleAiStatus(msg, bot) {
        const chatId = msg.chat.id;
        
        try {
            const status = await this.gigaChatService.checkStatus();
            const tokenInfo = this.gigaChatService.getTokenInfo();
            
            let statusMessage = `🤖 Статус GigaChat:\n\n`;
            
            if (status.status === 'connected') {
                statusMessage += `✅ Подключение активно\n`;
                statusMessage += `📊 Доступные модели: ${status.modelsCount}\n`;
            } else {
                statusMessage += `❌ Ошибка подключения: ${status.error}\n`;
            }
            
            statusMessage += `🔑 Токен: ${tokenInfo.isValid ? 'активен' : 'недействителен'}\n`;
            
            if (tokenInfo.expiresAt) {
                statusMessage += `⏰ Истекает: ${tokenInfo.expiresAt.toLocaleString()}`;
            }
            
            bot.sendMessage(chatId, statusMessage);
        } catch (error) {
            const errorMessage = `❌ Ошибка подключения к GigaChat:\n\n${error.message}\n\nПроверьте настройки в файле config.js`;
            bot.sendMessage(chatId, errorMessage);
        }
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