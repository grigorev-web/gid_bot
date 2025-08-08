const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../../logs');
        this.logFile = path.join(this.logDir, 'bot.log');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    formatMessage(level, message) {
        const timestamp = this.getTimestamp();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    }

    writeToFile(message) {
        try {
            fs.appendFileSync(this.logFile, message);
        } catch (error) {
            console.error('Ошибка записи в лог файл:', error.message);
        }
    }

    log(level, message) {
        const formattedMessage = this.formatMessage(level, message);
        
        // Вывод в консоль
        console.log(formattedMessage.trim());
        
        // Запись в файл
        this.writeToFile(formattedMessage);
    }

    info(message) {
        this.log('info', message);
    }

    error(message) {
        this.log('error', message);
    }

    warn(message) {
        this.log('warn', message);
    }

    debug(message) {
        this.log('debug', message);
    }

    botStart() {
        this.info('🤖 Бот запущен');
    }

    shutdown(signal) {
        this.info(`🛑 Получен сигнал ${signal}, завершение работы...`);
    }
}

module.exports = new Logger(); 