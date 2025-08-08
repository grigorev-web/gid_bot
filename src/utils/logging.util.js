function logUserAndChatInfo(msg) {
    console.log('\n' + '='.repeat(60));
    console.log('📱 НОВОЕ СООБЩЕНИЕ');
    console.log('='.repeat(60));
    
    // Информация о сообщении
    console.log('📨 ИНФОРМАЦИЯ О СООБЩЕНИИ:');
    console.log(`   ID сообщения: ${msg.message_id}`);
    console.log(`   Дата: ${new Date(msg.date * 1000).toLocaleString()}`);
    console.log(`   Текст: "${msg.text}"`);
    console.log(`   Тип чата: ${msg.chat.type}`);
    
    // Информация о пользователе
    console.log('\n👤 ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ:');
    console.log(`   ID пользователя: ${msg.from.id}`);
    console.log(`   Имя: ${msg.from.first_name}`);
    console.log(`   Фамилия: ${msg.from.last_name || 'не указана'}`);
    console.log(`   Username: @${msg.from.username || 'не указан'}`);
    console.log(`   Язык: ${msg.from.language_code || 'не указан'}`);
    console.log(`   Бот: ${msg.from.is_bot ? 'Да' : 'Нет'}`);
    
    // Информация о чате
    console.log('\n💬 ИНФОРМАЦИЯ О ЧАТЕ:');
    console.log(`   ID чата: ${msg.chat.id}`);
    console.log(`   Тип: ${msg.chat.type}`);
    console.log(`   Название: ${msg.chat.title || 'личный чат'}`);
    console.log(`   Username: @${msg.chat.username || 'не указан'}`);
    console.log(`   Имя: ${msg.chat.first_name || 'не указано'}`);
    console.log(`   Фамилия: ${msg.chat.last_name || 'не указана'}`);
    
    // Дополнительная информация
    console.log('\n🔧 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ:');
    console.log(`   Forward from: ${msg.forward_from ? `ID: ${msg.forward_from.id}` : 'нет'}`);
    console.log(`   Reply to message: ${msg.reply_to_message ? `ID: ${msg.reply_to_message.message_id}` : 'нет'}`);
    console.log(`   Edit date: ${msg.edit_date ? new Date(msg.edit_date * 1000).toLocaleString() : 'нет'}`);
    console.log(`   Via bot: ${msg.via_bot ? `ID: ${msg.via_bot.id}` : 'нет'}`);
    
    // Информация о медиа (если есть)
    if (msg.photo || msg.video || msg.audio || msg.document || msg.voice || msg.sticker) {
        console.log('\n📎 МЕДИА ФАЙЛЫ:');
        if (msg.photo) console.log(`   Фото: ${msg.photo.length} вариантов`);
        if (msg.video) console.log(`   Видео: ${msg.video.file_name || 'без названия'}`);
        if (msg.audio) console.log(`   Аудио: ${msg.audio.title || 'без названия'}`);
        if (msg.document) console.log(`   Документ: ${msg.document.file_name || 'без названия'}`);
        if (msg.voice) console.log(`   Голосовое сообщение`);
        if (msg.sticker) console.log(`   Стикер: ${msg.sticker.emoji || 'без эмодзи'}`);
    }
    
    console.log('='.repeat(60) + '\n');
}

module.exports = {
    logUserAndChatInfo
}; 