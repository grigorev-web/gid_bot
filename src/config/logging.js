module.exports = {
    // Уровень логирования
    level: process.env.LOG_LEVEL || 'info',
    
    // Директория для логов
    logDir: process.env.LOG_DIR || 'logs',
    
    // Настройки ротации файлов
    rotation: {
        // Частота ротации
        frequency: 'month', // 'daily', 'weekly', 'month'
        
        // Максимальный размер файла
        maxSize: '20m',
        
        // Количество файлов для хранения
        maxFiles: 12,
        
        // Формат имени файла
        filename: 'bot-%Y-%m.log',
        
        // Формат для ошибок
        errorFilename: 'error-%Y-%m.log',
        
        // Формат для отладочных логов
        debugFilename: 'debug-%Y-%m.log'
    },
    
    // Настройки формата логов
    format: {
        // Формат временной метки
        timestamp: 'YYYY-MM-DD HH:mm:ss',
        
        // Включать ли стек ошибок
        includeStack: true,
        
        // Включать ли метаданные
        includeMeta: true
    },
    
    // Настройки консоли
    console: {
        // Включать ли логирование в консоль
        enabled: process.env.NODE_ENV !== 'production',
        
        // Цветной вывод
        colors: true
    },
    
    // Настройки очистки
    cleanup: {
        // Автоматическая очистка старых логов
        autoCleanup: true,
        
        // Количество месяцев для хранения
        monthsToKeep: 12,
        
        // Интервал очистки (в днях)
        cleanupInterval: 30
    },
    
    // Настройки производительности
    performance: {
        // Логировать ли время выполнения операций
        logExecutionTime: true,
        
        // Логировать ли использование памяти
        logMemoryUsage: true,
        
        // Логировать ли статистику по запросам
        logRequestStats: true
    },
    
    // Настройки мониторинга
    monitoring: {
        // Включить мониторинг размера логов
        enableSizeMonitoring: true,
        
        // Предупреждение при превышении размера
        sizeWarningThreshold: '100m',
        
        // Критический размер логов
        sizeCriticalThreshold: '500m'
    }
}; 