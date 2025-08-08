const Database = require('../connection/database');
const logger = require('../../shared/logger/logger');

class Message {
    constructor() {
        this.db = Database;
    }

    async init() {
        await this.db.connect();
        await this.createTable();
    }

    async createTable() {
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
        
        try {
            await this.db.run(sql);
            logger.info('✅ Таблица messages создана/проверена');
        } catch (error) {
            logger.error(`Ошибка создания таблицы messages: ${error.message}`);
            throw error;
        }
    }

    async saveMessage(messageData, isAiResponse = false, aiData = null) {
        const sql = `
            INSERT INTO messages (
                telegram_id, message_id, chat_id, message_type, content,
                file_id, file_size, file_name, mime_type, duration,
                width, height, caption, reply_to_message_id,
                forward_from_chat_id, forward_from_message_id,
                is_ai_response, ai_model, ai_tokens_used, ai_response_time_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            messageData.from.id,
            messageData.message_id,
            messageData.chat.id,
            this.getMessageType(messageData),
            messageData.text || messageData.caption || null,
            messageData.document?.file_id || messageData.photo?.[0]?.file_id || messageData.video?.file_id || null,
            messageData.document?.file_size || messageData.photo?.[0]?.file_size || messageData.video?.file_size || null,
            messageData.document?.file_name || null,
            messageData.document?.mime_type || messageData.video?.mime_type || null,
            messageData.video?.duration || messageData.audio?.duration || null,
            messageData.photo?.[0]?.width || messageData.video?.width || null,
            messageData.photo?.[0]?.height || messageData.video?.height || null,
            messageData.caption || null,
            messageData.reply_to_message?.message_id || null,
            messageData.forward_from_chat?.id || null,
            messageData.forward_from_message_id || null,
            isAiResponse,
            aiData?.model || null,
            aiData?.tokens_used || null,
            aiData?.response_time_ms || null
        ];

        try {
            const result = await this.db.run(sql, params);
            logger.info(`Сообщение ${messageData.message_id} сохранено`);
            return result;
        } catch (error) {
            logger.error(`Ошибка сохранения сообщения: ${error.message}`);
            throw error;
        }
    }

    getMessageType(messageData) {
        if (messageData.text) return 'text';
        if (messageData.photo) return 'photo';
        if (messageData.video) return 'video';
        if (messageData.audio) return 'audio';
        if (messageData.document) return 'document';
        if (messageData.voice) return 'voice';
        if (messageData.video_note) return 'video_note';
        if (messageData.sticker) return 'sticker';
        if (messageData.animation) return 'animation';
        if (messageData.contact) return 'contact';
        if (messageData.location) return 'location';
        return 'unknown';
    }

    async getMessageHistory(telegramId, limit = 50) {
        const sql = `
            SELECT * FROM messages 
            WHERE telegram_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        
        try {
            const messages = await this.db.all(sql, [telegramId, limit]);
            return messages.reverse(); // Возвращаем в хронологическом порядке
        } catch (error) {
            logger.error(`Ошибка получения истории сообщений: ${error.message}`);
            throw error;
        }
    }

    async getAiResponses(telegramId, limit = 20) {
        const sql = `
            SELECT * FROM messages 
            WHERE telegram_id = ? AND is_ai_response = TRUE
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        
        try {
            const messages = await this.db.all(sql, [telegramId, limit]);
            return messages.reverse();
        } catch (error) {
            logger.error(`Ошибка получения AI ответов: ${error.message}`);
            throw error;
        }
    }

    async getMessageStats(telegramId) {
        const sql = `
            SELECT 
                COUNT(*) as total_messages,
                COUNT(CASE WHEN is_ai_response = TRUE THEN 1 END) as ai_responses,
                COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
                COUNT(CASE WHEN message_type = 'photo' THEN 1 END) as photo_messages,
                COUNT(CASE WHEN message_type = 'video' THEN 1 END) as video_messages,
                SUM(CASE WHEN ai_tokens_used IS NOT NULL THEN ai_tokens_used ELSE 0 END) as total_tokens,
                AVG(CASE WHEN ai_response_time_ms IS NOT NULL THEN ai_response_time_ms ELSE 0 END) as avg_response_time
            FROM messages 
            WHERE telegram_id = ?
        `;
        
        try {
            const stats = await this.db.get(sql, [telegramId]);
            return stats;
        } catch (error) {
            logger.error(`Ошибка получения статистики сообщений: ${error.message}`);
            throw error;
        }
    }

    async getGlobalStats() {
        const sql = `
            SELECT 
                COUNT(*) as total_messages,
                COUNT(DISTINCT telegram_id) as unique_users,
                COUNT(CASE WHEN is_ai_response = TRUE THEN 1 END) as total_ai_responses,
                SUM(CASE WHEN ai_tokens_used IS NOT NULL THEN ai_tokens_used ELSE 0 END) as total_tokens_used,
                AVG(CASE WHEN ai_response_time_ms IS NOT NULL THEN ai_response_time_ms ELSE 0 END) as avg_response_time
            FROM messages
        `;
        
        try {
            const stats = await this.db.get(sql);
            return stats;
        } catch (error) {
            logger.error(`Ошибка получения глобальной статистики: ${error.message}`);
            throw error;
        }
    }

    async deleteOldMessages(days = 30) {
        const sql = `
            DELETE FROM messages 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        
        try {
            const result = await this.db.run(sql, [days]);
            logger.info(`Удалено ${result.changes} старых сообщений`);
            return result;
        } catch (error) {
            logger.error(`Ошибка удаления старых сообщений: ${error.message}`);
            throw error;
        }
    }

    async close() {
        await this.db.disconnect();
    }
}

module.exports = Message; 