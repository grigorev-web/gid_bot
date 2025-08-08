const Database = require('../connection/database');
const logger = require('../../shared/logger/logger');

class User {
    constructor() {
        this.db = Database;
    }

    async init() {
        await this.db.connect();
        await this.createTable();
    }

    async createTable() {
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
        
        try {
            await this.db.run(sql);
            logger.info('✅ Таблица users создана/проверена');
        } catch (error) {
            logger.error(`Ошибка создания таблицы users: ${error.message}`);
            throw error;
        }
    }

    async createOrUpdate(userData) {
        const sql = `
            INSERT INTO users (
                telegram_id, username, first_name, last_name, language_code,
                is_bot, is_premium, added_to_attachment_menu, can_join_groups,
                can_read_all_group_messages, supports_inline_queries
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                username = VALUES(username),
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                language_code = VALUES(language_code),
                is_bot = VALUES(is_bot),
                is_premium = VALUES(is_premium),
                added_to_attachment_menu = VALUES(added_to_attachment_menu),
                can_join_groups = VALUES(can_join_groups),
                can_read_all_group_messages = VALUES(can_read_all_group_messages),
                supports_inline_queries = VALUES(supports_inline_queries),
                updated_at = CURRENT_TIMESTAMP
        `;
        
        const params = [
            userData.id,
            userData.username || null,
            userData.first_name || null,
            userData.last_name || null,
            userData.language_code || 'ru',
            userData.is_bot || false,
            userData.is_premium || false,
            userData.added_to_attachment_menu || false,
            userData.can_join_groups || true,
            userData.can_read_all_group_messages || false,
            userData.supports_inline_queries || false
        ];

        try {
            const result = await this.db.run(sql, params);
            logger.info(`Пользователь ${userData.id} создан/обновлен`);
            return result;
        } catch (error) {
            logger.error(`Ошибка создания/обновления пользователя: ${error.message}`);
            throw error;
        }
    }

    async findByTelegramId(telegramId) {
        const sql = 'SELECT * FROM users WHERE telegram_id = ?';
        
        try {
            const user = await this.db.get(sql, [telegramId]);
            return user;
        } catch (error) {
            logger.error(`Ошибка поиска пользователя: ${error.message}`);
            throw error;
        }
    }

    async updateLastActivity(telegramId) {
        const sql = 'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE telegram_id = ?';
        
        try {
            await this.db.run(sql, [telegramId]);
        } catch (error) {
            logger.error(`Ошибка обновления активности пользователя: ${error.message}`);
            throw error;
        }
    }

    async incrementMessageCount(telegramId) {
        const sql = 'UPDATE users SET message_count = message_count + 1 WHERE telegram_id = ?';
        
        try {
            await this.db.run(sql, [telegramId]);
        } catch (error) {
            logger.error(`Ошибка увеличения счетчика сообщений: ${error.message}`);
            throw error;
        }
    }

    async incrementAiRequestsCount(telegramId) {
        const sql = 'UPDATE users SET ai_requests_count = ai_requests_count + 1 WHERE telegram_id = ?';
        
        try {
            await this.db.run(sql, [telegramId]);
        } catch (error) {
            logger.error(`Ошибка увеличения счетчика AI запросов: ${error.message}`);
            throw error;
        }
    }

    async updateSettings(telegramId, settings) {
        const sql = 'UPDATE users SET settings = ? WHERE telegram_id = ?';
        
        try {
            await this.db.run(sql, [JSON.stringify(settings), telegramId]);
        } catch (error) {
            logger.error(`Ошибка обновления настроек пользователя: ${error.message}`);
            throw error;
        }
    }

    async getSettings(telegramId) {
        const sql = 'SELECT settings FROM users WHERE telegram_id = ?';
        
        try {
            const result = await this.db.get(sql, [telegramId]);
            if (result && result.settings) {
                return JSON.parse(result.settings);
            } else {
                // Возвращаем настройки по умолчанию для новых пользователей
                return {
                    language: 'ru',
                    notifications: true,
                    autoSave: true
                };
            }
        } catch (error) {
            logger.error(`Ошибка получения настроек пользователя: ${error.message}`);
            // Возвращаем настройки по умолчанию в случае ошибки
            return {
                language: 'ru',
                notifications: true,
                autoSave: true
            };
        }
    }

    async getAllUsers() {
        const sql = 'SELECT * FROM users ORDER BY created_at DESC';
        
        try {
            return await this.db.all(sql);
        } catch (error) {
            logger.error(`Ошибка получения всех пользователей: ${error.message}`);
            throw error;
        }
    }

    async getActiveUsers(days = 7) {
        const sql = `
            SELECT * FROM users 
            WHERE last_activity >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY last_activity DESC
        `;
        
        try {
            return await this.db.all(sql, [days]);
        } catch (error) {
            logger.error(`Ошибка получения активных пользователей: ${error.message}`);
            throw error;
        }
    }

    async close() {
        await this.db.disconnect();
    }
}

module.exports = User; 