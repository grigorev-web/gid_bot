const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../../logs');
        this.ensureLogDirectory();
        this.setupWinston();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    setupWinston() {
        // Формат для логов
        const logFormat = winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );

        // Формат для консоли (более читаемый)
        const consoleFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
                format: 'HH:mm:ss'
            }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(meta).length > 0) {
                    msg += ` ${JSON.stringify(meta)}`;
                }
                return msg;
            })
        );

        // Создаем логгер
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            defaultMeta: { service: 'telegram-bot' },
            transports: [
                // Логи по месяцам
                new DailyRotateFile({
                    filename: path.join(this.logDir, 'bot-%Y-%m.log'),
                    datePattern: 'YYYY-MM',
                    frequency: 'month',
                    maxSize: '20m',
                    maxFiles: '12', // Хранить логи за 12 месяцев
                    format: logFormat,
                    level: 'info'
                }),
                
                // Логи ошибок по месяцам
                new DailyRotateFile({
                    filename: path.join(this.logDir, 'error-%Y-%m.log'),
                    datePattern: 'YYYY-MM',
                    frequency: 'month',
                    maxSize: '20m',
                    maxFiles: '12',
                    format: logFormat,
                    level: 'error'
                }),

                // Детальные логи по месяцам
                new DailyRotateFile({
                    filename: path.join(this.logDir, 'debug-%Y-%m.log'),
                    datePattern: 'YYYY-MM',
                    frequency: 'month',
                    maxSize: '20m',
                    maxFiles: '12',
                    format: logFormat,
                    level: 'debug'
                })
            ]
        });

        // Добавляем логирование в консоль для разработки
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: consoleFormat
            }));
        }

        // Обработка ошибок winston
        this.logger.on('error', (error) => {
            console.error('Ошибка логгера:', error);
        });

        // Обработка ротации файлов
        this.logger.transports.forEach(transport => {
            if (transport instanceof DailyRotateFile) {
                transport.on('rotate', (oldFilename, newFilename) => {
                    console.log(`📅 Ротация логов: ${oldFilename} → ${newFilename}`);
                });
            }
        });
    }

    // Основные методы логирования
    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    // Специальные методы для бота
    botStart() {
        this.info('🤖 Бот запущен', { 
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || 'unknown'
        });
    }

    botStop(signal) {
        this.info('🛑 Бот остановлен', { 
            signal,
            timestamp: new Date().toISOString()
        });
    }

    messageReceived(message) {
        this.info('📨 Получено сообщение', {
            chatId: message.chat?.id,
            userId: message.from?.id,
            username: message.from?.username,
            messageType: message.text ? 'text' : 'other'
        });
    }

    commandExecuted(command, userId, chatId) {
        this.info('⚡ Выполнена команда', {
            command,
            userId,
            chatId,
            timestamp: new Date().toISOString()
        });
    }

    errorOccurred(error, context = {}) {
        this.error('❌ Произошла ошибка', {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }

    // Методы для получения информации о логах
    getCurrentLogFiles() {
        try {
            const files = fs.readdirSync(this.logDir);
            return files
                .filter(file => file.endsWith('.log'))
                .sort()
                .reverse();
        } catch (error) {
            console.error('Ошибка чтения директории логов:', error.message);
            return [];
        }
    }

    getLogFileInfo() {
        try {
            const files = this.getCurrentLogFiles();
            const fileInfo = files.map(file => {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    modified: stats.mtime,
                    created: stats.birthtime
                };
            });
            return fileInfo;
        } catch (error) {
            console.error('Ошибка получения информации о файлах логов:', error.message);
            return [];
        }
    }

    // Метод для очистки старых логов
    async cleanupOldLogs(monthsToKeep = 12) {
        try {
            const files = this.getCurrentLogFiles();
            const now = new Date();
            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                const fileAge = (now - stats.mtime) / (1000 * 60 * 60 * 24 * 30); // в месяцах
                
                if (fileAge > monthsToKeep) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    console.log(`🗑️ Удален старый файл логов: ${file}`);
                }
            }

            this.info(`Очистка логов завершена`, { 
                deletedCount,
                monthsToKeep 
            });

            return deletedCount;
        } catch (error) {
            this.error('Ошибка очистки старых логов', { error: error.message });
            return 0;
        }
    }

    // Метод для получения статистики логов
    getLogStats() {
        try {
            const files = this.getLogFileInfo();
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            const oldestFile = files[files.length - 1];
            const newestFile = files[0];

            return {
                totalFiles: files.length,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                oldestFile: oldestFile?.name,
                newestFile: newestFile?.name,
                lastModified: newestFile?.modified
            };
        } catch (error) {
            this.error('Ошибка получения статистики логов', { error: error.message });
            return null;
        }
    }
}

module.exports = new Logger(); 