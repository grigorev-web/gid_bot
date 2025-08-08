const https = require('https');
const crypto = require('crypto');
const config = require('../../../config');

class TokenService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Генерация уникального RqUID
    generateRqUID() {
        return crypto.randomUUID();
    }

    // Получение Authorization key
    getAuthKey() {
        return config.GIGACHAT.AUTHORIZATION_KEY;
    }

    // Получение Access token
    async getAccessToken() {
        return new Promise((resolve, reject) => {
            const authKey = this.getAuthKey();
            if (authKey === 'YOUR_AUTHORIZATION_KEY_HERE') {
                reject(new Error('Необходимо указать Authorization key в config.js'));
                return;
            }

            const postData = `scope=${config.GIGACHAT.SCOPE}`;
            const rqUID = this.generateRqUID();

            const options = {
                hostname: 'ngw.devices.sberbank.ru',
                port: 9443,
                path: '/api/v2/oauth',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'RqUID': rqUID,
                    'Authorization': `Basic ${authKey}`
                },
                // Игнорируем SSL ошибки для GigaChat API
                rejectUnauthorized: false,
                requestCert: false,
                agent: false
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.access_token) {
                            this.accessToken = response.access_token;
                            this.tokenExpiry = Date.now() + config.GIGACHAT.TOKEN_LIFETIME;
                            console.log('✅ Access token получен успешно');
                            resolve(this.accessToken);
                        } else {
                            reject(new Error(`Ошибка получения токена: ${data}`));
                        }
                    } catch (error) {
                        reject(new Error(`Ошибка парсинга ответа: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Ошибка запроса: ${error.message}`));
            });

            req.write(postData);
            req.end();
        });
    }

    // Проверка и обновление токена при необходимости
    async ensureValidToken() {
        if (!this.accessToken || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
            console.log('🔄 Обновление Access token...');
            await this.getAccessToken();
        }
        return this.accessToken;
    }

    // Получение текущего токена
    getCurrentToken() {
        return this.accessToken;
    }

    // Проверка активности токена
    isTokenValid() {
        return this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
    }
}

module.exports = TokenService; 