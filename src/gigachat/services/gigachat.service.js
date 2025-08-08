const https = require('https');
const crypto = require('crypto');
const logger = require('../../shared/logger/logger');

class GigaChatService {
    constructor() {
        this.clientId = '97cfcff6-3d5b-414b-926c-eb84b359b1f6';
        this.scope = 'GIGACHAT_API_PERS';
        this.authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
        this.apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1';
        this.accessToken = null;
        this.tokenExpiry = null;
        this.tokenRefreshPromise = null;
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    // Генерация уникального RqUID
    generateRqUID() {
        return crypto.randomUUID();
    }

    // Получение Authorization key из конфигурации
    getAuthKey() {
        const config = require('../../../../config');
        return config.GIGACHAT.AUTHORIZATION_KEY;
    }

    // Получение Access token с кэшированием
    async getAccessToken() {
        // Если токен еще действителен, возвращаем его
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        // Если уже идет обновление токена, ждем его завершения
        if (this.tokenRefreshPromise) {
            return this.tokenRefreshPromise;
        }

        // Создаем новый промис для обновления токена
        this.tokenRefreshPromise = this._refreshAccessToken();
        
        try {
            const token = await this.tokenRefreshPromise;
            return token;
        } finally {
            this.tokenRefreshPromise = null;
        }
    }

    // Внутренний метод для обновления токена
    async _refreshAccessToken() {
        return new Promise((resolve, reject) => {
            const authKey = this.getAuthKey();
            if (!authKey || authKey === 'YOUR_AUTHORIZATION_KEY_HERE') {
                const error = new Error('Необходимо указать GIGACHAT_AUTH_KEY в конфигурации');
                logger.error(error.message);
                reject(error);
                return;
            }

            logger.info('🔄 Запрос нового Access token для GigaChat...');

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
                            logger.info('✅ Access token получен успешно');
                            logger.info(`⏰ Токен действителен до: ${new Date(this.tokenExpiry).toLocaleString('ru-RU')}`);
                            resolve(this.accessToken);
                        } else {
                            const error = new Error(`Ошибка получения токена: ${data}`);
                            logger.error(error.message);
                            reject(error);
                        }
                    } catch (error) {
                        const parseError = new Error(`Ошибка парсинга ответа: ${error.message}`);
                        logger.error(parseError.message);
                        reject(parseError);
                    }
                });
            });

            req.on('error', (error) => {
                const requestError = new Error(`Ошибка запроса: ${error.message}`);
                logger.error(requestError.message);
                reject(requestError);
            });

            req.write(postData);
            req.end();
        });
    }

    // Отправка сообщения в GigaChat с очередью запросов
    async sendMessage(message, userName = 'Пользователь', context = []) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const requestData = {
                model: 'GigaChat:latest',
                messages: [
                    {
                        role: 'system',
                        content: `Ты полезный ассистент. Отвечай кратко и по делу. Пользователь: ${userName}`
                    },
                    ...context,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            };
            console.log("***************************************");
            console.log(requestData.messages);
            console.log("***************************************");
            // Логируем запрос к GigaChat
            logger.info(`🤖 Отправка запроса к GigaChat API:`);
            logger.info(`📝 Сообщение: ${message}`);
            logger.info(`👤 Пользователь: ${userName}`);
            logger.info(`📋 Контекст: ${context.length} сообщений`);
            logger.info(`🔧 Параметры: model=${requestData.model}, temperature=${requestData.temperature}, max_tokens=${requestData.max_tokens}`);
            
            // Логируем весь контекст
            logger.info(`📋 Полный контекст для GigaChat:`);
            requestData.messages.forEach((msg, index) => {
                logger.info(`   ${index + 1}. [${msg.role}] ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
            });

            const makeRequest = async () => {
                try {
                    const token = await this.getAccessToken();
                    
                    return new Promise((resolveRequest, rejectRequest) => {
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
                                        const responseTime = Date.now() - startTime;
                                        
                                        logger.info(`🤖 GigaChat ответ (${responseTime}ms): ${aiResponse.substring(0, 100)}...`);
                                        logger.info(`📊 Статистика ответа: tokens_used=${response.usage?.total_tokens || 0}, response_time=${responseTime}ms`);
                                        
                                        resolveRequest({
                                            content: aiResponse,
                                            model: 'GigaChat:latest',
                                            tokens_used: response.usage?.total_tokens || 0,
                                            response_time_ms: responseTime
                                        });
                                    } else {
                                        const error = new Error(`Неожиданный формат ответа: ${data}`);
                                        logger.error(error.message);
                                        rejectRequest(error);
                                    }
                                } catch (error) {
                                    const parseError = new Error(`Ошибка парсинга ответа: ${error.message}`);
                                    logger.error(parseError.message);
                                    rejectRequest(parseError);
                                }
                            });
                        });

                        req.on('error', (error) => {
                            const requestError = new Error(`Ошибка запроса к GigaChat: ${error.message}`);
                            logger.error(requestError.message);
                            rejectRequest(requestError);
                        });

                        req.write(JSON.stringify(requestData));
                        req.end();
                    });
                } catch (error) {
                    reject(error);
                }
            };

            // Добавляем запрос в очередь
            this.requestQueue.push({ makeRequest, resolve, reject });
            
            // Запускаем обработку очереди, если она еще не запущена
            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }

    // Обработка очереди запросов
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const { makeRequest, resolve, reject } = this.requestQueue.shift();
            
            try {
                const result = await makeRequest();
                resolve(result);
            } catch (error) {
                reject(error);
            }

            // Небольшая задержка между запросами
            if (this.requestQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        this.isProcessingQueue = false;
    }

    // Получение списка доступных моделей
    async getModels() {
        try {
            const token = await this.getAccessToken();
            
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
                            const parseError = new Error(`Ошибка парсинга ответа: ${error.message}`);
                            logger.error(parseError.message);
                            reject(parseError);
                        }
                    });
                });

                req.on('error', (error) => {
                    const requestError = new Error(`Ошибка запроса: ${error.message}`);
                    logger.error(requestError.message);
                    reject(requestError);
                });

                req.end();
            });
        } catch (error) {
            throw new Error(`Ошибка получения моделей: ${error.message}`);
        }
    }

    // Проверка статуса API
    async checkStatus() {
        try {
            const models = await this.getModels();
            return {
                status: 'ok',
                models: models.data || [],
                available: true
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                available: false
            };
        }
    }

    // Очистка ресурсов
    cleanup() {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.tokenRefreshPromise = null;
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }
}

module.exports = GigaChatService; 