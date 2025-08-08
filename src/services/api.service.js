const https = require('https');
const config = require('../../../config');

class ApiService {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }

    // Выполнение HTTP запроса
    async makeRequest(options, data = null) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseData);
                        resolve(response);
                    } catch (error) {
                        reject(new Error(`Ошибка парсинга ответа: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Ошибка запроса: ${error.message}`));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    // Получение токена для запроса
    async getTokenForRequest() {
        return await this.tokenService.ensureValidToken();
    }

    // Создание заголовков для запроса
    createHeaders(token, contentType = 'application/json') {
        return {
            'Content-Type': contentType,
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
}

module.exports = ApiService; 