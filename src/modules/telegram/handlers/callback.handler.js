class CallbackHandler {
    constructor(gigaChatService) {
        this.gigaChatService = gigaChatService;
    }

    // Обработка нажатий на кнопки
    async handleCallback(callbackQuery, bot) {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        const userName = callbackQuery.from.first_name;
        
        console.log(`🔘 Нажата кнопка: ${data} пользователем ${userName}`);
        
        let responseText = '';
        
        switch (data) {
            case 'start_bot':
                responseText = `🚀 Привет, ${userName}! Бот уже запущен и готов к работе!\n\nОтправьте мне любое сообщение, и я отвечу с помощью ИИ! 🤖`;
                break;
                
            case 'about_bot':
                responseText = `ℹ️ О боте:\n\n🤖 Название: Telegram Bot с GigaChat\n📅 Версия: 1.0.0\n🔧 Язык: JavaScript\n🤖 ИИ: GigaChat API\n📊 Режим: Поллинг\n\nУмный бот с интеграцией российского ИИ GigaChat для обработки сообщений.`;
                break;
                
            case 'settings':
                responseText = `🛠️ Настройки:\n\n⚙️ Архитектура: Модульная\n📁 Структура: src/modules/\n🔧 Конфигурация: config.js\n🤖 ИИ: GigaChat\n\nНастройки можно изменить в файле config.js`;
                break;
                
            default:
                responseText = `❓ Неизвестная команда: ${data}`;
        }
        
        // Отвечаем на callback query
        bot.answerCallbackQuery(callbackQuery.id, {
            text: '✅ Обработано!'
        });
        
        // Отправляем ответ
        bot.sendMessage(chatId, responseText);
    }
}

module.exports = CallbackHandler; 