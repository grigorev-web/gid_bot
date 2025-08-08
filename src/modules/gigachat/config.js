module.exports = {
    // Основные настройки API
    CLIENT_ID: '97cfcff6-3d5b-414b-926c-eb84b359b1f6',
    SCOPE: 'GIGACHAT_API_PERS',
    
    // URL для авторизации и API
    AUTH_URL: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    API_URL: 'https://gigachat.devices.sberbank.ru/api/v1',
    
    // Настройки модели
    MODEL: 'GigaChat:latest',
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1000,
    
    // Настройки токена
    TOKEN_LIFETIME: 30 * 60 * 1000, // 30 минут в миллисекундах
    
    // SSL настройки
    SSL: {
        REJECT_UNAUTHORIZED: false,
        REQUEST_CERT: false,
        AGENT: false
    }
}; 