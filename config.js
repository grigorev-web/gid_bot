module.exports = {
    // ===== НАСТРОЙКИ TELEGRAM БОТА =====
    
    // Токен вашего Telegram бота (получите у @BotFather)
    BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
    
    // Другие настройки бота
    BOT_USERNAME: 'YOUR_BOT_USERNAME',
    
    // Настройки поллинга
    POLLING_INTERVAL: 1000, // миллисекунды
    
    // Настройки логирования
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    
    // Настройки команд
    COMMANDS: {
        START: '/start',
        HELP: '/help',
        ECHO: '/echo',
        AI_STATUS: '/ai_status',
        STATS: '/stats',
        SETTINGS: '/settings'
    },
    
    // ===== НАСТРОЙКИ GIGACHAT API =====
    
    // Authorization key для GigaChat (ЗАМЕНИТЕ НА ВАШ КЛЮЧ)
    GIGACHAT_AUTH_KEY: 'YOUR_AUTHORIZATION_KEY_HERE',
    
    // Основные настройки API
    GIGACHAT: {
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
        
        // Настройки очереди запросов
        REQUEST_QUEUE_DELAY: 100, // миллисекунды между запросами
        MAX_CONCURRENT_REQUESTS: 5
    },
    
    // ===== НАСТРОЙКИ БАЗЫ ДАННЫХ MYSQL =====
    
    DATABASE: {
        // Настройки подключения к MySQL
        HOST: 'dm2grig.beget.tech',
        PORT: 3306,
        USER: 'dm2grig_gid',
        PASSWORD: 'your_password',
        NAME: 'dm2grig_gid',
        
        // Настройки подключения
        CONNECTION_TIMEOUT: 30000, // миллисекунды
        
        // Настройки очистки старых данных
        CLEANUP: {
            MESSAGE_RETENTION_DAYS: 30, // дней хранения сообщений
            AUTO_CLEANUP_ENABLED: true,
            CLEANUP_INTERVAL_HOURS: 24 // часы между очистками
        }
    },
    
    // ===== НАСТРОЙКИ ЛОГИРОВАНИЯ =====
    
    LOGGING: {
        // Уровень логирования
        LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        
        // Настройки файлов логов
        FILE: {
            ENABLED: true,
            PATH: './logs/bot.log',
            MAX_SIZE: '10m', // максимальный размер файла
            MAX_FILES: 5 // количество файлов ротации
        },
        
        // Настройки консольного вывода
        CONSOLE: {
            ENABLED: true,
            COLORIZE: true
        }
    },
    
    // ===== НАСТРОЙКИ БЕЗОПАСНОСТИ =====
    
    SECURITY: {
        // Максимальное количество сообщений в минуту от одного пользователя
        RATE_LIMIT: {
            MESSAGES_PER_MINUTE: 10,
            AI_REQUESTS_PER_MINUTE: 5
        },
        
        // Список заблокированных пользователей
        BLOCKED_USERS: [],
        
        // Список администраторов
        ADMIN_USERS: []
    }
}; 