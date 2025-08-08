class ResponseParser {
    // Парсинг JSON ответа от GigaChat
    static parseGigaChatResponse(response) {
        try {
            // Пытаемся распарсить JSON
            const parsed = JSON.parse(response);
            
            // Проверяем наличие поля answer
            if (parsed.answer) {
                return parsed.answer;
            }
            
            // Если нет поля answer, возвращаем весь ответ
            return response;
        } catch (error) {
            // Если не удалось распарсить JSON, возвращаем исходный ответ
            console.log('⚠️ Не удалось распарсить JSON ответ:', error.message);
            return response;
        }
    }

    // Обработка ошибок парсинга
    static handleParseError(response, error) {
        console.error('❌ Ошибка парсинга ответа GigaChat:', error.message);
        console.log('📄 Исходный ответ:', response);
        return response;
    }
}

module.exports = ResponseParser; 