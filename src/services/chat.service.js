const config = require('../../../config');
const prompts = require('../config/prompts');
const ResponseParser = require('../utils/response.parser');

class ChatService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    // Отправка сообщения в GigaChat
    async sendMessage(message, userName = 'Пользователь') {
        try {
            const token = await this.apiService.getTokenForRequest();
            
            const requestData = {
                model: config.GIGACHAT.MODEL,
                messages: [
                    {
                        role: 'system',
                        content: prompts.SYSTEM_PROMPT(userName)
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: config.GIGACHAT.TEMPERATURE,
                max_tokens: config.GIGACHAT.MAX_TOKENS
            };
            
            const options = {
                hostname: 'gigachat.devices.sberbank.ru',
                port: 443,
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: this.apiService.createHeaders(token),
                // Игнорируем SSL ошибки для GigaChat API
                rejectUnauthorized: false,
                requestCert: false,
                agent: false
            };

            const response = await this.apiService.makeRequest(options, requestData);
            
            if (response.choices && response.choices[0] && response.choices[0].message) {
                const rawResponse = response.choices[0].message.content;
                console.log(`🤖 GigaChat сырой ответ: ${rawResponse}`);
                
                // Парсим ответ через обработчик
                const parsedResponse = ResponseParser.parseGigaChatResponse(rawResponse);
                console.log(`✅ Обработанный ответ: ${parsedResponse}`);
                
                return parsedResponse;
            } else {
                throw new Error(`Неожиданный формат ответа: ${JSON.stringify(response)}`);
            }
        } catch (error) {
            throw new Error(`Ошибка отправки сообщения в GigaChat: ${error.message}`);
        }
    }

    // Получение списка доступных моделей
    async getModels() {
        try {
            const token = await this.apiService.getTokenForRequest();
            
            const options = {
                hostname: 'gigachat.devices.sberbank.ru',
                port: 443,
                path: '/api/v1/models',
                method: 'GET',
                headers: this.apiService.createHeaders(token),
                // Игнорируем SSL ошибки для GigaChat API
                rejectUnauthorized: false,
                requestCert: false,
                agent: false
            };

            return await this.apiService.makeRequest(options);
        } catch (error) {
            throw new Error(`Ошибка получения моделей: ${error.message}`);
        }
    }
}

module.exports = ChatService; 