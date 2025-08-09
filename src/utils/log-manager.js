const logger = require('../shared/logger/logger');
const fs = require('fs');
const path = require('path');

class LogManager {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
    }

    // Получить статистику по логам
    getStats() {
        return logger.getLogStats();
    }

    // Получить список всех файлов логов
    getLogFiles() {
        return logger.getCurrentLogFiles();
    }

    // Получить содержимое конкретного файла логов
    getLogContent(filename, lines = 100) {
        try {
            const filePath = path.join(this.logDir, filename);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Файл ${filename} не найден`);
            }

            const content = fs.readFileSync(filePath, 'utf8');
            const linesArray = content.split('\n');
            
            // Возвращаем последние N строк
            return linesArray.slice(-lines).join('\n');
        } catch (error) {
            logger.errorOccurred(error, { context: 'getLogContent', filename });
            throw error;
        }
    }

    // Поиск по логам
    searchLogs(query, filename = null, maxResults = 50) {
        try {
            const files = filename ? [filename] : logger.getCurrentLogFiles();
            const results = [];

            for (const file of files) {
                const filePath = path.join(this.logDir, file);
                if (!fs.existsSync(filePath)) continue;

                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');

                for (let i = 0; i < lines.length && results.length < maxResults; i++) {
                    if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            file,
                            line: i + 1,
                            content: lines[i],
                            timestamp: this.extractTimestamp(lines[i])
                        });
                    }
                }
            }

            return results;
        } catch (error) {
            logger.errorOccurred(error, { context: 'searchLogs', query });
            throw error;
        }
    }

    // Извлечь временную метку из строки лога
    extractTimestamp(logLine) {
        try {
            const match = logLine.match(/"timestamp":"([^"]+)"/);
            return match ? match[1] : null;
        } catch (error) {
            return null;
        }
    }

    // Очистить старые логи
    async cleanupOldLogs(monthsToKeep = 12) {
        return await logger.cleanupOldLogs(monthsToKeep);
    }

    // Получить размер логов в удобочитаемом формате
    getLogSizeFormatted() {
        const stats = this.getStats();
        if (!stats) return 'Неизвестно';

        const sizes = ['B', 'KB', 'MB', 'GB'];
        let size = stats.totalSize;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < sizes.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${sizes[unitIndex]}`;
    }

    // Получить логи за определенный период
    getLogsByPeriod(startDate, endDate) {
        try {
            const files = this.getLogFiles();
            const results = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            for (const file of files) {
                // Извлекаем дату из имени файла (формат: bot-YYYY-MM.log)
                const dateMatch = file.match(/bot-(\d{4})-(\d{2})/);
                if (!dateMatch) continue;

                const fileDate = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, 1);
                
                if (fileDate >= start && fileDate <= end) {
                    const filePath = path.join(this.logDir, file);
                    if (fs.existsSync(filePath)) {
                        const stats = fs.statSync(filePath);
                        results.push({
                            filename: file,
                            date: fileDate,
                            size: stats.size,
                            modified: stats.mtime
                        });
                    }
                }
            }

            return results.sort((a, b) => a.date - b.date);
        } catch (error) {
            logger.errorOccurred(error, { context: 'getLogsByPeriod', startDate, endDate });
            throw error;
        }
    }

    // Экспорт логов в JSON
    exportLogsToJson(filename, startDate = null, endDate = null) {
        try {
            let files = this.getLogFiles();
            
            if (startDate && endDate) {
                const periodFiles = this.getLogsByPeriod(startDate, endDate);
                files = periodFiles.map(f => f.filename);
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                totalFiles: files.length,
                logs: []
            };

            for (const file of files) {
                const filePath = path.join(this.logDir, file);
                if (!fs.existsSync(filePath)) continue;

                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').filter(line => line.trim());

                const fileLogs = lines.map(line => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        return { raw: line, parseError: true };
                    }
                });

                exportData.logs.push({
                    filename: file,
                    lineCount: fileLogs.length,
                    data: fileLogs
                });
            }

            const exportPath = path.join(this.logDir, `export-${filename}.json`);
            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
            
            logger.info(`Логи экспортированы в ${exportPath}`, { 
                exportPath, 
                totalFiles: exportData.totalFiles 
            });

            return exportPath;
        } catch (error) {
            logger.errorOccurred(error, { context: 'exportLogsToJson', filename });
            throw error;
        }
    }

    // Получить информацию о производительности логгера
    getPerformanceInfo() {
        try {
            const stats = this.getStats();
            const files = this.getLogFiles();
            
            return {
                totalFiles: stats?.totalFiles || 0,
                totalSize: stats?.totalSizeMB || '0',
                averageFileSize: files.length > 0 ? 
                    (stats.totalSize / files.length / (1024 * 1024)).toFixed(2) + ' MB' : '0 MB',
                oldestFile: stats?.oldestFile || 'Нет',
                newestFile: stats?.newestFile || 'Нет',
                lastModified: stats?.lastModified || 'Нет'
            };
        } catch (error) {
            logger.errorOccurred(error, { context: 'getPerformanceInfo' });
            return null;
        }
    }
}

module.exports = new LogManager(); 