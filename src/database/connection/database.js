const mysql = require('mysql2/promise');
const logger = require('../../shared/logger/logger');

class Database {
    constructor() {
        this.connection = null;
        this.config = require('../../../../config');
    }

    async connect() {
        try {
            if (!this.connection) {
                this.connection = await mysql.createConnection({
                    host: this.config.DATABASE.HOST,
                    port: this.config.DATABASE.PORT,
                    user: this.config.DATABASE.USER,
                    password: this.config.DATABASE.PASSWORD,
                    database: this.config.DATABASE.NAME,
                    charset: 'utf8mb4',
                    timezone: '+00:00'
                });

                logger.info('✅ База данных MySQL подключена успешно');
            }
        } catch (error) {
            logger.error(`Ошибка подключения к базе данных: ${error.message}`);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.connection) {
                await this.connection.end();
                this.connection = null;
                logger.info('✅ Соединение с базой данных закрыто');
            }
        } catch (error) {
            logger.error(`Ошибка закрытия базы данных: ${error.message}`);
            throw error;
        }
    }

    async run(sql, params = []) {
        try {
            if (!this.connection || this.connection.state === 'disconnected') {
                await this.connect();
            }
            const [result] = await this.connection.execute(sql, params);
            return { 
                id: result.insertId, 
                changes: result.affectedRows 
            };
        } catch (error) {
            logger.error(`Ошибка выполнения запроса: ${error.message}`);
            // Попробуем переподключиться и повторить запрос
            if (error.message.includes('closed state') || error.message.includes('disconnected')) {
                logger.info('🔄 Попытка переподключения к базе данных...');
                this.connection = null;
                await this.connect();
                const [result] = await this.connection.execute(sql, params);
                return { 
                    id: result.insertId, 
                    changes: result.affectedRows 
                };
            }
            throw error;
        }
    }

    async get(sql, params = []) {
        try {
            if (!this.connection || this.connection.state === 'disconnected') {
                await this.connect();
            }
            const [rows] = await this.connection.execute(sql, params);
            return rows[0] || null;
        } catch (error) {
            logger.error(`Ошибка получения данных: ${error.message}`);
            // Попробуем переподключиться и повторить запрос
            if (error.message.includes('closed state') || error.message.includes('disconnected')) {
                logger.info('🔄 Попытка переподключения к базе данных...');
                this.connection = null;
                await this.connect();
                const [rows] = await this.connection.execute(sql, params);
                return rows[0] || null;
            }
            throw error;
        }
    }

    async all(sql, params = []) {
        try {
            if (!this.connection || this.connection.state === 'disconnected') {
                await this.connect();
            }
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        } catch (error) {
            logger.error(`Ошибка получения всех данных: ${error.message}`);
            // Попробуем переподключиться и повторить запрос
            if (error.message.includes('closed state') || error.message.includes('disconnected')) {
                logger.info('🔄 Попытка переподключения к базе данных...');
                this.connection = null;
                await this.connect();
                const [rows] = await this.connection.execute(sql, params);
                return rows;
            }
            throw error;
        }
    }

    async transaction(callback) {
        try {
            if (!this.connection) {
                await this.connect();
            }
            await this.connection.beginTransaction();
            
            try {
                await callback(this);
                await this.connection.commit();
            } catch (error) {
                await this.connection.rollback();
                throw error;
            }
        } catch (error) {
            logger.error(`Ошибка транзакции: ${error.message}`);
            throw error;
        }
    }
}

// Создаем синглтон
const databaseInstance = new Database();

module.exports = databaseInstance; 