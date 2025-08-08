module.exports = {
    // Настройки поллинга
    POLLING_INTERVAL: 1000, // миллисекунды
    
    // Настройки логирования
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    
    // Настройки команд
    COMMANDS: {
        START: '/start',
        HELP: '/help',
        ECHO: '/echo',
        AI_STATUS: '/ai_status'
    },
    
    // Настройки бота
    REQUEST_TIMEOUT: 30000,
    DEBUG_MODE: false
}; 