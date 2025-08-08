const TokenService = require('./token.service');
const ApiService = require('./api.service');
const ChatService = require('./chat.service');

class GigaChatService {
    constructor() {
        this.tokenService = new TokenService();
        this.apiService = new ApiService(this.tokenService);
        this.chatService = new ChatService(this.apiService);
    }

    // Отправка сообщения в GigaChat
    async sendMessage(message, userName = 'Пользователь') {
        return await this.chatService.sendMessage(message, userName);
    }

    // Получение списка моделей
    async getModels() {
        return await this.chatService.getModels();
    }

    // Проверка статуса подключения
    async checkStatus() {
        try {
            const models = await this.getModels();
            return {
                status: 'connected',
                modelsCount: models.data ? models.data.length : 0,
                tokenValid: this.tokenService.isTokenValid()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                tokenValid: this.tokenService.isTokenValid()
            };
        }
    }

    // Получение информации о токене
    getTokenInfo() {
        return {
            hasToken: !!this.tokenService.getCurrentToken(),
            isValid: this.tokenService.isTokenValid(),
            expiresAt: this.tokenService.tokenExpiry ? new Date(this.tokenService.tokenExpiry) : null
        };
    }
}

module.exports = GigaChatService; 