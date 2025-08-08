const https = require('https');
const crypto = require('crypto');

class GigaChatAPI {
    constructor() {
        this.clientId = '97cfcff6-3d5b-414b-926c-eb84b359b1f6';
        this.scope = 'GIGACHAT_API_PERS';
        this.authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
        this.apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Генерация уникального RqUID
    generateRqUID() {
        return crypto.randomUUID();
    }

    // Получение Authorization key (нужно будет получить от пользователя)
    getAuthKey() {
        // Здесь нужно будет вставить полученный Authorization key
        return 'YOUR_AUTHORIZATION_KEY_HERE';
    }

    // Получение Access token
    async getAccessToken() {
        return new Promise((resolve, reject) => {
            const authKey = this.getAuthKey();
            if (authKey === 'YOUR_AUTHORIZATION_KEY_HERE') {
                reject(new Error('Необходимо указать Authorization key в gigachat.js'));
                return;
            }

            const postData = `scope=${this.scope}`;
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
                }
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
                            // Токен действует 30 минут, устанавливаем время истечения
                            this.tokenExpiry = Date.now() + (30 * 60 * 1000);
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

    // Отправка сообщения в GigaChat
    async sendMessage(message, userName = 'Пользователь') {
        try {
            const token = await this.ensureValidToken();
            
            return new Promise((resolve, reject) => {
                const requestData = {
                    model: 'GigaChat:latest',
                    messages: [
                        {
                            role: 'system',
                            content: `Ты полезный ассистент. Отвечай кратко и по делу. Пользователь: ${userName}`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                };

                const options = {
                    hostname: 'gigachat.devices.sberbank.ru',
                    port: 443,
                    path: '/api/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            if (response.choices && response.choices[0] && response.choices[0].message) {
                                const aiResponse = response.choices[0].message.content;
                                console.log(`🤖 GigaChat ответ: ${aiResponse}`);
                                resolve(aiResponse);
                            } else {
                                reject(new Error(`Неожиданный формат ответа: ${data}`));
                            }
                        } catch (error) {
                            reject(new Error(`Ошибка парсинга ответа: ${error.message}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    reject(new Error(`Ошибка запроса к GigaChat: ${error.message}`));
                });

                req.write(JSON.stringify(requestData));
                req.end();
            });
        } catch (error) {
            throw new Error(`Ошибка отправки сообщения в GigaChat: ${error.message}`);
        }
    }

    // Получение списка доступных моделей
    async getModels() {
        try {
            const token = await this.ensureValidToken();
            
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'gigachat.devices.sberbank.ru',
                    port: 443,
                    path: '/api/v1/models',
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            resolve(response);
                        } catch (error) {
                            reject(new Error(`Ошибка парсинга ответа: ${error.message}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    reject(new Error(`Ошибка запроса: ${error.message}`));
                });

                req.end();
            });
        } catch (error) {
            throw new Error(`Ошибка получения моделей: ${error.message}`);
        }
    }
}

module.exports = GigaChatAPI; 