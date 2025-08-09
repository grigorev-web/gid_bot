const Database = require('../connection/database');
const logger = require('../../shared/logger/logger');

class CityGuideMigration {
    constructor() {
        this.db = Database;
    }

    async up() {
        try {
            await this.db.connect();
            
            // Создание таблиц в правильном порядке (сначала зависимости)
            await this.createAddressesTable();
            await this.createCategoriesTable();
            await this.createEstablishmentsTable();
            await this.createEventsTable();
            await this.createPromotionsTable();
            await this.createAttractionsTable();
            await this.createWorkingHoursTable();
            
            // Создание связующих таблиц
            await this.createEstablishmentCategoriesTable();
            await this.createEventCategoriesTable();
            await this.createPromotionCategoriesTable();
            await this.createAttractionCategoriesTable();
            
            // Создание представлений
            await this.createViews();
            
            // Создание индексов
            await this.createIndexes();
            
            // Заполнение базовыми категориями
            await this.insertBaseCategories();
            
            logger.info('✅ Миграция 002_city_guide_schema выполнена успешно');
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
            
            // Удаление представлений
            await this.dropViews();
            
            // Удаление связующих таблиц
            await this.db.run('DROP TABLE IF EXISTS attraction_categories');
            await this.db.run('DROP TABLE IF EXISTS promotion_categories');
            await this.db.run('DROP TABLE IF EXISTS event_categories');
            await this.db.run('DROP TABLE IF EXISTS establishment_categories');
            
            // Удаление основных таблиц
            await this.db.run('DROP TABLE IF EXISTS working_hours');
            await this.db.run('DROP TABLE IF EXISTS attractions');
            await this.db.run('DROP TABLE IF EXISTS promotions');
            await this.db.run('DROP TABLE IF EXISTS events');
            await this.db.run('DROP TABLE IF EXISTS establishments');
            await this.db.run('DROP TABLE IF EXISTS categories');
            await this.db.run('DROP TABLE IF EXISTS addresses');
            
            logger.info('✅ Откат миграции 002_city_guide_schema выполнен успешно');
        } catch (error) {
            logger.error(`Ошибка отката миграции: ${error.message}`);
            throw error;
        } finally {
            await this.db.disconnect();
        }
    }

    async createAddressesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS addresses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                street VARCHAR(255) NOT NULL,
                house_number VARCHAR(20) NOT NULL,
                apartment VARCHAR(20),
                city VARCHAR(100) NOT NULL DEFAULT 'Москва',
                postal_code VARCHAR(10),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица addresses создана');
    }

    async createCategoriesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                parent_id INT NULL,
                level INT NOT NULL DEFAULT 1,
                entity_type ENUM('establishment', 'event', 'promotion', 'attraction') NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица categories создана');
    }

    async createEstablishmentsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS establishments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                address_id INT NOT NULL,
                phone VARCHAR(20),
                website VARCHAR(255),
                email VARCHAR(255),
                rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
                price_range ENUM('budget', 'moderate', 'expensive', 'luxury') DEFAULT 'moderate',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица establishments создана');
    }

    async createEventsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS events (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                event_type ENUM('concert', 'party', 'city_holiday', 'exhibition', 'theater', 'cinema', 'other') NOT NULL,
                start_date DATETIME NOT NULL,
                end_date DATETIME NOT NULL,
                address_id INT NULL,
                establishment_id INT NULL,
                price DECIMAL(10,2),
                max_participants INT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
                FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL,
                CHECK (establishment_id IS NOT NULL OR address_id IS NOT NULL)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица events создана');
    }

    async createPromotionsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS promotions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                promotion_type ENUM('discount', 'special_offer', 'happy_hours', 'loyalty_program') NOT NULL,
                discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100),
                discount_amount DECIMAL(10,2),
                start_date DATE,
                end_date DATE,
                valid_days JSON, -- [1,2,3,4,5,6,7] - дни недели
                valid_hours JSON, -- {"start": "18:00", "end": "23:00"}
                address_id INT NULL,
                establishment_id INT NULL,
                is_permanent BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
                FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL,
                CHECK (establishment_id IS NOT NULL OR address_id IS NOT NULL)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица promotions создана');
    }

    async createAttractionsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS attractions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                attraction_type ENUM('landmark', 'park', 'museum', 'monument', 'viewpoint', 'other') NOT NULL,
                address_id INT NOT NULL,
                rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
                is_free BOOLEAN DEFAULT TRUE,
                entry_fee DECIMAL(10,2),
                opening_hours TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица attractions создана');
    }

    async createWorkingHoursTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS working_hours (
                id INT PRIMARY KEY AUTO_INCREMENT,
                establishment_id INT NOT NULL,
                day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
                open_time TIME NOT NULL,
                close_time TIME NOT NULL,
                is_24h BOOLEAN DEFAULT FALSE,
                is_closed BOOLEAN DEFAULT FALSE,
                break_start TIME NULL,
                break_end TIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
                UNIQUE KEY unique_day_hours (establishment_id, day_of_week)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица working_hours создана');
    }

    async createEstablishmentCategoriesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS establishment_categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                establishment_id INT NOT NULL,
                category_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                UNIQUE KEY unique_establishment_category (establishment_id, category_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица establishment_categories создана');
    }

    async createEventCategoriesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS event_categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                event_id INT NOT NULL,
                category_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                UNIQUE KEY unique_event_category (event_id, category_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица event_categories создана');
    }

    async createPromotionCategoriesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS promotion_categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                promotion_id INT NOT NULL,
                category_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                UNIQUE KEY unique_promotion_category (promotion_id, category_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица promotion_categories создана');
    }

    async createAttractionCategoriesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS attraction_categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                attraction_id INT NOT NULL,
                category_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                UNIQUE KEY unique_attraction_category (attraction_id, category_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.db.run(sql);
        logger.info('✅ Таблица attraction_categories создана');
    }

    async createViews() {
        // Представление для работающих сейчас заведений
        const workingNowView = `
            CREATE OR REPLACE VIEW working_now AS
            SELECT 
                e.id,
                e.name,
                e.description,
                e.address_id,
                wh.close_time,
                TIMEDIFF(wh.close_time, TIME(NOW())) as time_until_close,
                wh.is_24h
            FROM establishments e
            JOIN working_hours wh ON e.id = wh.establishment_id
            WHERE wh.day_of_week = WEEKDAY(NOW()) + 1
              AND wh.is_closed = FALSE
              AND e.is_active = TRUE
              AND (
                wh.is_24h = TRUE 
                OR (
                  TIME(NOW()) BETWEEN wh.open_time AND wh.close_time
                  AND (wh.break_start IS NULL OR TIME(NOW()) NOT BETWEEN wh.break_start AND wh.break_end)
                )
              )
        `;
        
        await this.db.run(workingNowView);
        
        // Представление для активных акций
        const activePromotionsView = `
            CREATE OR REPLACE VIEW active_promotions AS
            SELECT 
                p.*,
                CASE 
                    WHEN p.is_permanent = TRUE THEN TRUE
                    WHEN p.start_date IS NULL AND p.end_date IS NULL THEN TRUE
                    WHEN CURDATE() BETWEEN p.start_date AND p.end_date THEN TRUE
                    ELSE FALSE
                END as is_currently_active
            FROM promotions p
            WHERE p.is_active = TRUE
        `;
        
        await this.db.run(activePromotionsView);
        
        logger.info('✅ Представления созданы');
    }

    async createIndexes() {
        try {
            // Индексы для addresses
            await this.db.run('CREATE INDEX idx_addresses_city ON addresses(city)');
            await this.db.run('CREATE INDEX idx_addresses_coordinates ON addresses(latitude, longitude)');
            
            // Индексы для categories
            await this.db.run('CREATE INDEX idx_categories_parent_id ON categories(parent_id)');
            await this.db.run('CREATE INDEX idx_categories_entity_type ON categories(entity_type)');
            await this.db.run('CREATE INDEX idx_categories_level ON categories(level)');
            
            // Индексы для establishments
            await this.db.run('CREATE INDEX idx_establishments_address_id ON establishments(address_id)');
            await this.db.run('CREATE INDEX idx_establishments_rating ON establishments(rating)');
            await this.db.run('CREATE INDEX idx_establishments_is_active ON establishments(is_active)');
            
            // Индексы для events
            await this.db.run('CREATE INDEX idx_events_start_date ON events(start_date)');
            await this.db.run('CREATE INDEX idx_events_end_date ON events(end_date)');
            await this.db.run('CREATE INDEX idx_events_establishment_id ON events(establishment_id)');
            await this.db.run('CREATE INDEX idx_events_address_id ON events(address_id)');
            
            // Индексы для promotions
            await this.db.run('CREATE INDEX idx_promotions_start_date ON promotions(start_date)');
            await this.db.run('CREATE INDEX idx_promotions_end_date ON promotions(end_date)');
            await this.db.run('CREATE INDEX idx_promotions_establishment_id ON promotions(establishment_id)');
            await this.db.run('CREATE INDEX idx_promotions_address_id ON promotions(address_id)');
            
            // Индексы для attractions
            await this.db.run('CREATE INDEX idx_attractions_address_id ON attractions(address_id)');
            await this.db.run('CREATE INDEX idx_attractions_rating ON attractions(rating)');
            
            // Индексы для working_hours
            await this.db.run('CREATE INDEX idx_working_hours_day_time ON working_hours(day_of_week, open_time, close_time)');
            await this.db.run('CREATE INDEX idx_working_hours_establishment ON working_hours(establishment_id)');
            
            logger.info('✅ Индексы созданы');
        } catch (error) {
            logger.info('ℹ️ Некоторые индексы уже существуют или не могут быть созданы');
        }
    }

    async insertBaseCategories() {
        try {
            // Базовые категории для заведений
            const establishmentCategories = [
                { name: 'Ресторан', description: 'Рестораны и кафе', entity_type: 'establishment', level: 1 },
                { name: 'Бар', description: 'Бары и пабы', entity_type: 'establishment', level: 1 },
                { name: 'Ночной клуб', description: 'Ночные клубы и дискотеки', entity_type: 'establishment', level: 1 },
                { name: 'Кинотеатр', description: 'Кинотеатры', entity_type: 'establishment', level: 1 },
                { name: 'Театр', description: 'Театры', entity_type: 'establishment', level: 1 },
                { name: 'Развлечения', description: 'Развлекательные центры', entity_type: 'establishment', level: 1 }
            ];

            for (const category of establishmentCategories) {
                await this.db.run(
                    'INSERT INTO categories (name, description, entity_type, level) VALUES (?, ?, ?, ?)',
                    [category.name, category.description, category.entity_type, category.level]
                );
            }

            // Базовые категории для событий
            const eventCategories = [
                { name: 'Концерт', description: 'Музыкальные концерты', entity_type: 'event', level: 1 },
                { name: 'Вечеринка', description: 'Вечеринки и тусовки', entity_type: 'event', level: 1 },
                { name: 'Городской праздник', description: 'Городские праздники и фестивали', entity_type: 'event', level: 1 },
                { name: 'Выставка', description: 'Выставки и экспозиции', entity_type: 'event', level: 1 }
            ];

            for (const category of eventCategories) {
                await this.db.run(
                    'INSERT INTO categories (name, description, entity_type, level) VALUES (?, ?, ?, ?)',
                    [category.name, category.description, category.entity_type, category.level]
                );
            }

            // Базовые категории для акций
            const promotionCategories = [
                { name: 'Скидка', description: 'Скидки и специальные предложения', entity_type: 'promotion', level: 1 },
                { name: 'Happy Hours', description: 'Счастливые часы', entity_type: 'promotion', level: 1 },
                { name: 'Программа лояльности', description: 'Программы лояльности', entity_type: 'promotion', level: 1 }
            ];

            for (const category of promotionCategories) {
                await this.db.run(
                    'INSERT INTO categories (name, description, entity_type, level) VALUES (?, ?, ?, ?)',
                    [category.name, category.description, category.entity_type, category.level]
                );
            }

            // Базовые категории для достопримечательностей
            const attractionCategories = [
                { name: 'Достопримечательность', description: 'Исторические достопримечательности', entity_type: 'attraction', level: 1 },
                { name: 'Парк', description: 'Парки и скверы', entity_type: 'attraction', level: 1 },
                { name: 'Музей', description: 'Музеи и галереи', entity_type: 'attraction', level: 1 },
                { name: 'Смотровая площадка', description: 'Смотровые площадки', entity_type: 'attraction', level: 1 }
            ];

            for (const category of attractionCategories) {
                await this.db.run(
                    'INSERT INTO categories (name, description, entity_type, level) VALUES (?, ?, ?, ?)',
                    [category.name, category.description, category.entity_type, category.level]
                );
            }

            logger.info('✅ Базовые категории добавлены');
        } catch (error) {
            logger.info('ℹ️ Базовые категории уже существуют или не могут быть добавлены');
        }
    }

    async dropViews() {
        try {
            await this.db.run('DROP VIEW IF EXISTS active_promotions');
            await this.db.run('DROP VIEW IF EXISTS working_now');
            logger.info('✅ Представления удалены');
        } catch (error) {
            logger.info('ℹ️ Представления не существуют или не могут быть удалены');
        }
    }
}

module.exports = CityGuideMigration; 