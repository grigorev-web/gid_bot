const InitialMigration = require('./migrations/001_initial_schema');
const logger = require('../shared/logger/logger');

async function runMigrations() {
    try {
        console.log('🔄 Запуск миграций базы данных...');
        
        // Выполнение начальной миграции
        const initialMigration = new InitialMigration();
        await initialMigration.up();
        
        console.log('✅ Все миграции выполнены успешно!');
        
    } catch (error) {
        console.error('❌ Ошибка выполнения миграций:', error.message);
        logger.error(`Ошибка выполнения миграций: ${error.message}`);
        process.exit(1);
    }
}

async function rollbackMigrations() {
    try {
        console.log('🔄 Откат миграций базы данных...');
        
        // Откат начальной миграции
        const initialMigration = new InitialMigration();
        await initialMigration.down();
        
        console.log('✅ Все миграции откачены успешно!');
        
    } catch (error) {
        console.error('❌ Ошибка отката миграций:', error.message);
        logger.error(`Ошибка отката миграций: ${error.message}`);
        process.exit(1);
    }
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const command = args[0];

if (command === 'up') {
    runMigrations();
} else if (command === 'down') {
    rollbackMigrations();
} else {
    console.log('Использование:');
    console.log('  node src/database/migrate.js up   - Выполнить миграции');
    console.log('  node src/database/migrate.js down - Откатить миграции');
    process.exit(1);
} 