module.exports = {
    // Telegram Bot Configuration
    TELEGRAM: {
        BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
        WEBHOOK_URL: process.env.WEBHOOK_URL || null,
        POLLING: true
    },

    // GigaChat Configuration
    GIGACHAT_AUTH_KEY: 'YOUR_GIGACHAT_AUTH_KEY_HERE',
    GIGACHAT: {
        BASE_URL: 'https://gigachat.devices.sberbank.ru/api/v1',
        AUTHORIZATION_KEY: 'YOUR_GIGACHAT_AUTH_KEY_HERE',
        REQUEST_QUEUE_DELAY: 1000,
        MAX_CONCURRENT_REQUESTS: 5,
        MODELS: {
            DEFAULT: 'GigaChat:latest',
            FAST: 'GigaChat-Pro:latest'
        },
        PARAMETERS: {
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9,
            repetition_penalty: 1.1
        }
    },

    // Database Configuration (MySQL)
    DATABASE: {
        HOST: 'your_mysql_host',
        PORT: 3306,
        USER: 'your_mysql_user',
        PASSWORD: 'your_mysql_password',
        NAME: 'your_database_name',
        CONNECTION_TIMEOUT: 30000,
        CLEANUP: {
            MESSAGE_RETENTION_DAYS: 30,
            AUTO_CLEANUP_ENABLED: true,
            CLEANUP_INTERVAL_HOURS: 24
        }
    },

    // Bot Commands
    COMMANDS: {
        START: '/start',
        HELP: '/help',
        AI_STATUS: '/ai_status',
        STATS: '/stats',
        SETTINGS: '/settings',
        ECHO: '/echo'
    },

    // Logging Configuration
    LOGGING: {
        LEVEL: 'info',
        FILE_PATH: 'logs/bot.log',
        MAX_FILE_SIZE: '10m',
        MAX_FILES: 5
    },

    // Security Configuration
    SECURITY: {
        MAX_MESSAGE_LENGTH: 4096,
        RATE_LIMIT_PER_USER: 10, // messages per minute
        BLOCKED_USERS: []
    }
}; 