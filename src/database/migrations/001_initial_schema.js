const Database = require('../connection/database');
const logger = require('../../shared/logger/logger');

class InitialMigration {
    constructor() {
        this.db = Database;
    }

    async up() {
        try {
            await this.db.connect();
            
            // Создание таблицы пользователей
            await this.createUsersTable();
            
            // Создание таблицы сообщений
            await this.createMessagesTable();
            
            // Создание индексов для оптимизации
            await this.createIndexes();
            
            logger.info('✅ Миграция 001_initial_schema выполнена успешно');
        } catch (error) {
            logger.error(`Ошибка выполнения миграции: ${error.message}`);
            throw error;
        } finally {
            await this.db.disconnect();
        }
    }

    async down() {
        try {
            await this.db.connect();
            
            // Удаление индексов
            await this.dropIndexes();
            
            // Удаление таблиц
            await this.db.run('DROP TABLE IF EXISTS messages');
            await this.db.run('DROP TABLE IF EXISTS users');
            
            logger.info('✅ Откат миграции 001_initial_schema выполнен успешно');
        } catch (error) {
            logger.error(`Ошибка отката миграции: ${error.message}`);
            throw error;
        } finally {
            await this.db.disconnect();
        }
    }

    async createUsersTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                telegram_id BIGINT UNIQUE NOT NULL,
                username VARCHAR(255),
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                language_code VARCHAR(10) DEFAULT 'ru',
                is_bot BOOLEAN DEFAULT FALSE,
                is_premium BOOLEAN DEFAULT FALSE,
                added_to_attachment_menu BOOLEAN DEFAULT FALSE,
                can_join_groups BOOLEAN DEFAULT TRUE,
                can_read_all_group_messages BOOLEAN DEFAULT FALSE,
                supports_inline_queries BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message_count INT DEFAULT 0,
                ai_requests_count INT DEFAULT 0,
                is_blocked BOOLEAN DEFAULT FALSE,
                settings JSON
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица users создана');
    }

    async createMessagesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                telegram_id BIGINT NOT NULL,
                message_id BIGINT NOT NULL,
                chat_id BIGINT NOT NULL,
                message_type VARCHAR(50) NOT NULL,
                content TEXT,
                file_id VARCHAR(255),
                file_size INT,
                file_name VARCHAR(255),
                mime_type VARCHAR(100),
                duration INT,
                width INT,
                height INT,
                caption TEXT,
                reply_to_message_id BIGINT,
                forward_from_chat_id BIGINT,
                forward_from_message_id BIGINT,
                is_ai_response BOOLEAN DEFAULT FALSE,
                ai_model VARCHAR(100),
                ai_tokens_used INT,
                ai_response_time_ms INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (telegram_id) REFERENCES users(telegram_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица messages создана');
    }

    async createIndexes() {
        try {
            // Индексы для таблицы users
            await this.db.run('CREATE INDEX idx_users_telegram_id ON users(telegram_id)');
            await this.db.run('CREATE INDEX idx_users_username ON users(username)');
            await this.db.run('CREATE INDEX idx_users_last_activity ON users(last_activity)');
            await this.db.run('CREATE INDEX idx_users_created_at ON users(created_at)');
            
            // Индексы для таблицы messages
            await this.db.run('CREATE INDEX idx_messages_telegram_id ON messages(telegram_id)');
            await this.db.run('CREATE INDEX idx_messages_chat_id ON messages(chat_id)');
            await this.db.run('CREATE INDEX idx_messages_created_at ON messages(created_at)');
            await this.db.run('CREATE INDEX idx_messages_is_ai_response ON messages(is_ai_response)');
            await this.db.run('CREATE INDEX idx_messages_message_type ON messages(message_type)');
            
            logger.info('✅ Индексы созданы');
        } catch (error) {
            // Если индексы уже существуют, это не критично
            logger.info('ℹ️ Индексы уже существуют или не могут быть созданы');
        }
    }

    async dropIndexes() {
        try {
            // Удаление индексов для таблицы users
            await this.db.run('DROP INDEX idx_users_telegram_id ON users');
            await this.db.run('DROP INDEX idx_users_username ON users');
            await this.db.run('DROP INDEX idx_users_last_activity ON users');
            await this.db.run('DROP INDEX idx_users_created_at ON users');
            
            // Удаление индексов для таблицы messages
            await this.db.run('DROP INDEX idx_messages_telegram_id ON messages');
            await this.db.run('DROP INDEX idx_messages_chat_id ON messages');
            await this.db.run('DROP INDEX idx_messages_created_at ON messages');
            await this.db.run('DROP INDEX idx_messages_is_ai_response ON messages');
            await this.db.run('DROP INDEX idx_messages_message_type ON messages');
            
            logger.info('✅ Индексы удалены');
        } catch (error) {
            // Если индексы не существуют, это не критично
            logger.info('ℹ️ Индексы не существуют или не могут быть удалены');
        }
    }
}

module.exports = InitialMigration; 