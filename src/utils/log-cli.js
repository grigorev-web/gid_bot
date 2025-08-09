#!/usr/bin/env node

const logManager = require('./log-manager');
const logger = require('../shared/logger/logger');
const readline = require('readline');

class LogCLI {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async run() {
        console.log('📊 Утилита управления логами Telegram бота');
        console.log('=====================================\n');

        const args = process.argv.slice(2);
        
        if (args.length > 0) {
            // Если переданы аргументы, выполняем команду напрямую
            await this.executeCommand(args);
        } else {
            // Интерактивный режим
            await this.interactiveMode();
        }

        this.rl.close();
    }

    async executeCommand(args) {
        const command = args[0];
        const params = args.slice(1);

        try {
            switch (command) {
                case 'stats':
                    this.showStats();
                    break;
                case 'list':
                    this.showLogFiles();
                    break;
                case 'view':
                    if (params[0]) {
                        await this.viewLogFile(params[0], params[1]);
                    } else {
                        console.log('❌ Укажите имя файла: view <filename> [lines]');
                    }
                    break;
                case 'search':
                    if (params[0]) {
                        await this.searchLogs(params[0], params[1], params[2]);
                    } else {
                        console.log('❌ Укажите поисковый запрос: search <query> [filename] [maxResults]');
                    }
                    break;
                case 'cleanup':
                    const months = params[0] ? parseInt(params[0]) : 12;
                    await this.cleanupLogs(months);
                    break;
                case 'export':
                    if (params[0]) {
                        await this.exportLogs(params[0], params[1], params[2]);
                    } else {
                        console.log('❌ Укажите имя файла: export <filename> [startDate] [endDate]');
                    }
                    break;
                case 'performance':
                    this.showPerformanceInfo();
                    break;
                case 'help':
                    this.showHelp();
                    break;
                default:
                    console.log(`❌ Неизвестная команда: ${command}`);
                    this.showHelp();
            }
        } catch (error) {
            console.error('❌ Ошибка выполнения команды:', error.message);
        }
    }

    async interactiveMode() {
        console.log('Доступные команды:');
        console.log('  stats      - Показать статистику логов');
        console.log('  list       - Список файлов логов');
        console.log('  view       - Просмотр файла логов');
        console.log('  search     - Поиск по логам');
        console.log('  cleanup    - Очистка старых логов');
        console.log('  export     - Экспорт логов');
        console.log('  performance - Информация о производительности');
        console.log('  help       - Справка');
        console.log('  exit       - Выход\n');

        while (true) {
            const answer = await this.question('Введите команду: ');
            
            if (answer.toLowerCase() === 'exit') {
                break;
            }

            const args = answer.trim().split(' ');
            if (args[0]) {
                await this.executeCommand(args);
                console.log('');
            }
        }
    }

    showStats() {
        const stats = logManager.getStats();
        if (!stats) {
            console.log('❌ Не удалось получить статистику');
            return;
        }

        console.log('📊 Статистика логов:');
        console.log(`  Всего файлов: ${stats.totalFiles}`);
        console.log(`  Общий размер: ${stats.totalSizeMB} MB`);
        console.log(`  Старейший файл: ${stats.oldestFile}`);
        console.log(`  Новейший файл: ${stats.newestFile}`);
        console.log(`  Последнее изменение: ${stats.lastModified}`);
    }

    showLogFiles() {
        const files = logManager.getLogFiles();
        if (files.length === 0) {
            console.log('📁 Файлы логов не найдены');
            return;
        }

        console.log('📁 Файлы логов:');
        files.forEach(file => {
            const filePath = require('path').join(logManager.logDir, file);
            try {
                const stats = require('fs').statSync(filePath);
                const size = (stats.size / 1024).toFixed(2);
                console.log(`  ${file} (${size} KB)`);
            } catch (error) {
                console.log(`  ${file} (ошибка чтения)`);
            }
        });
    }

    async viewLogFile(filename, lines = 100) {
        try {
            const content = logManager.getLogContent(filename, parseInt(lines) || 100);
            console.log(`📄 Содержимое файла ${filename} (последние ${lines} строк):`);
            console.log('='.repeat(80));
            console.log(content);
        } catch (error) {
            console.error('❌ Ошибка чтения файла:', error.message);
        }
    }

    async searchLogs(query, filename = null, maxResults = 50) {
        try {
            const results = logManager.searchLogs(query, filename, parseInt(maxResults) || 50);
            
            if (results.length === 0) {
                console.log(`🔍 По запросу "${query}" ничего не найдено`);
                return;
            }

            console.log(`🔍 Результаты поиска "${query}" (найдено: ${results.length}):`);
            console.log('='.repeat(80));

            results.forEach((result, index) => {
                console.log(`${index + 1}. Файл: ${result.file}, строка: ${result.line}`);
                console.log(`   Время: ${result.timestamp || 'неизвестно'}`);
                console.log(`   Содержимое: ${result.content.substring(0, 200)}...`);
                console.log('');
            });
        } catch (error) {
            console.error('❌ Ошибка поиска:', error.message);
        }
    }

    async cleanupLogs(monthsToKeep) {
        try {
            console.log(`🧹 Очистка логов старше ${monthsToKeep} месяцев...`);
            const deletedCount = await logManager.cleanupOldLogs(monthsToKeep);
            console.log(`✅ Удалено файлов: ${deletedCount}`);
        } catch (error) {
            console.error('❌ Ошибка очистки:', error.message);
        }
    }

    async exportLogs(filename, startDate = null, endDate = null) {
        try {
            console.log('📤 Экспорт логов...');
            const exportPath = logManager.exportLogsToJson(filename, startDate, endDate);
            console.log(`✅ Логи экспортированы в: ${exportPath}`);
        } catch (error) {
            console.error('❌ Ошибка экспорта:', error.message);
        }
    }

    showPerformanceInfo() {
        const info = logManager.getPerformanceInfo();
        if (!info) {
            console.log('❌ Не удалось получить информацию о производительности');
            return;
        }

        console.log('⚡ Информация о производительности:');
        console.log(`  Всего файлов: ${info.totalFiles}`);
        console.log(`  Общий размер: ${info.totalSize} MB`);
        console.log(`  Средний размер файла: ${info.averageFileSize}`);
        console.log(`  Старейший файл: ${info.oldestFile}`);
        console.log(`  Новейший файл: ${info.newestFile}`);
        console.log(`  Последнее изменение: ${info.lastModified}`);
    }

    showHelp() {
        console.log('📖 Справка по командам:');
        console.log('');
        console.log('  stats                    - Показать статистику логов');
        console.log('  list                     - Список файлов логов');
        console.log('  view <filename> [lines]  - Просмотр файла логов (по умолчанию 100 строк)');
        console.log('  search <query> [file] [max] - Поиск по логам');
        console.log('  cleanup [months]         - Очистка логов старше N месяцев (по умолчанию 12)');
        console.log('  export <name> [start] [end] - Экспорт логов в JSON');
        console.log('  performance               - Информация о производительности');
        console.log('  help                     - Показать эту справку');
        console.log('');
        console.log('Примеры:');
        console.log('  node log-cli.js stats');
        console.log('  node log-cli.js view bot-2024-01.log 50');
        console.log('  node log-cli.js search "ошибка"');
        console.log('  node log-cli.js export january-2024');
    }

    question(query) {
        return new Promise(resolve => {
            this.rl.question(query, resolve);
        });
    }
}

// Запуск CLI
if (require.main === module) {
    const cli = new LogCLI();
    cli.run().catch(console.error);
}

module.exports = LogCLI; 