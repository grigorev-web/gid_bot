-- База данных для системы заведений, мероприятий и акций города
-- Создание базы данных
CREATE DATABASE IF NOT EXISTS city_guide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE city_guide;

-- 1. Таблица адресов
CREATE TABLE addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    street VARCHAR(255),
    house_number VARCHAR(20),
    apartment VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_public_space BOOLEAN DEFAULT FALSE, -- для городских площадей, парков и т.д.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица категорий (с поддержкой вложенности)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT NULL, -- для вложенных категорий
    level INT DEFAULT 1, -- уровень вложенности
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 3. Таблица заведений
CREATE TABLE establishments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address_id INT,
    phone VARCHAR(50),
    website VARCHAR(255),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- 4. Таблица связи заведений с категориями
CREATE TABLE establishment_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    establishment_id INT NOT NULL,
    category_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- основная категория
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_establishment_category (establishment_id, category_id)
);

-- 5. Таблица часов работы
CREATE TABLE working_hours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    establishment_id INT NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=понедельник, 7=воскресенье
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_24h BOOLEAN DEFAULT FALSE, -- работает круглосуточно
    is_closed BOOLEAN DEFAULT FALSE, -- закрыто в этот день
    break_start TIME NULL, -- начало перерыва
    break_end TIME NULL, -- конец перерыва
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_day_hours (establishment_id, day_of_week)
);

-- 6. Таблица мероприятий
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('concert', 'party', 'theater', 'cinema', 'festival', 'meeting', 'other') NOT NULL,
    establishment_id INT NULL, -- NULL если мероприятие не привязано к заведению
    address_id INT NULL, -- адрес проведения (может быть тот же что у заведения или другой)
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    price DECIMAL(10, 2) NULL,
    max_participants INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- 7. Таблица связи мероприятий с категориями
CREATE TABLE event_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    category_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- основная категория
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_category (event_id, category_id)
);

-- 8. Таблица акций и скидок
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type ENUM('discount', 'special_offer', 'happy_hours', 'seasonal', 'weekday', 'weekend') NOT NULL,
    establishment_id INT NULL, -- NULL если акция городская
    discount_percent DECIMAL(5, 2) NULL, -- процент скидки
    discount_amount DECIMAL(10, 2) NULL, -- фиксированная сумма скидки
    min_order_amount DECIMAL(10, 2) NULL, -- минимальная сумма заказа
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    valid_days JSON, -- дни недели когда действует акция [1,2,3,4,5,6,7]
    valid_hours JSON, -- часы действия акции {"start": "18:00", "end": "23:00"}
    is_weekday_only BOOLEAN DEFAULT FALSE, -- только в будни
    is_weekend_only BOOLEAN DEFAULT FALSE, -- только в выходные
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL
);

-- 9. Таблица связи акций с категориями
CREATE TABLE promotion_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    promotion_id INT NOT NULL,
    category_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- основная категория
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_promotion_category (promotion_id, category_id)
);

-- 10. Таблица достопримечательностей
CREATE TABLE attractions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    attraction_type ENUM('landmark', 'park', 'monument', 'museum', 'viewpoint', 'historical_site') NOT NULL,
    address_id INT NOT NULL,
    best_visit_time VARCHAR(100), -- лучшее время для посещения
    is_free BOOLEAN DEFAULT TRUE,
    entrance_fee DECIMAL(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
);

-- 11. Таблица связи достопримечательностей с категориями
CREATE TABLE attraction_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attraction_id INT NOT NULL,
    category_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- основная категория
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attraction_category (attraction_id, category_id)
);

-- 12. Таблица изображений
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('establishment', 'event', 'promotion', 'attraction') NOT NULL,
    entity_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Таблица отзывов
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- предполагается система пользователей
    entity_type ENUM('establishment', 'event', 'attraction') NOT NULL,
    entity_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_addresses_coordinates ON addresses(latitude, longitude);
CREATE INDEX idx_establishments_address ON establishments(address_id);
CREATE INDEX idx_establishments_active ON establishments(is_active);
CREATE INDEX idx_working_hours_day_time ON working_hours(day_of_week, open_time, close_time);
CREATE INDEX idx_working_hours_establishment ON working_hours(establishment_id, day_of_week);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_establishment ON events(establishment_id);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_establishment ON promotions(establishment_id);
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX idx_reviews_entity ON reviews(entity_type, entity_id);

-- Создание представлений для удобства
CREATE VIEW working_now AS
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
  );

-- Создание представления для активных акций
CREATE VIEW active_promotions AS
SELECT 
    p.*,
    e.name as establishment_name,
    e.address_id
FROM promotions p
LEFT JOIN establishments e ON p.establishment_id = e.id
WHERE p.is_active = TRUE
  AND CURDATE() BETWEEN p.start_date AND p.end_date
  AND (
    (p.is_weekday_only = TRUE AND WEEKDAY(CURDATE()) < 5) OR
    (p.is_weekend_only = TRUE AND WEEKDAY(CURDATE()) >= 5) OR
    (p.is_weekday_only = FALSE AND p.is_weekend_only = FALSE)
  );

-- Вставка базовых категорий
INSERT INTO categories (name, description, level) VALUES
('Рестораны', 'Заведения общественного питания', 1),
('Бары', 'Бары и пабы', 1),
('Ночные клубы', 'Ночные клубы и дискотеки', 1),
('Кинотеатры', 'Кинотеатры и кинозалы', 1),
('Театры', 'Театры и концертные залы', 1),
('Развлечения', 'Развлекательные центры', 1),
('Красота', 'Салоны красоты и спа', 1),
('Спорт', 'Спортивные клубы и залы', 1),
('Образование', 'Образовательные учреждения', 1),
('Торговля', 'Магазины и торговые центры', 1);

-- Вставка вложенных категорий для ресторанов
INSERT INTO categories (name, description, parent_id, level) VALUES
('Азиатская кухня', 'Рестораны азиатской кухни', 1, 2),
('Европейская кухня', 'Рестораны европейской кухни', 1, 2),
('Русская кухня', 'Рестораны русской кухни', 1, 2),
('Итальянская кухня', 'Рестораны итальянской кухни', 1, 2),
('Лучшие рестораны', 'Топ рестораны города', 1, 2);

-- Вставка вложенных категорий для азиатской кухни
INSERT INTO categories (name, description, parent_id, level) VALUES
('Китайская кухня', 'Рестораны китайской кухни', 11, 3),
('Японская кухня', 'Рестораны японской кухни', 11, 3),
('Тайская кухня', 'Рестораны тайской кухни', 11, 3),
('Корейская кухня', 'Рестораны корейской кухни', 11, 3);

-- Вставка категорий для мероприятий
INSERT INTO categories (name, description, level) VALUES
('Концерты', 'Музыкальные концерты', 1),
('Вечеринки', 'Вечеринки и тусовки', 1),
('Фестивали', 'Городские фестивали', 1),
('Выставки', 'Художественные выставки', 1),
('Спортивные события', 'Спортивные мероприятия', 1);

-- Вставка вложенных категорий для концертов
INSERT INTO categories (name, description, parent_id, level) VALUES
('Рок-концерты', 'Рок музыка', 26, 2),
('Джаз-концерты', 'Джаз музыка', 26, 2),
('Классическая музыка', 'Классические концерты', 26, 2),
('Поп-концерты', 'Поп музыка', 26, 2);

-- Вставка категорий для акций
INSERT INTO categories (name, description, level) VALUES
('Скидки', 'Скидки и специальные предложения', 1),
('Happy Hours', 'Счастливые часы', 1),
('Сезонные акции', 'Акции по сезонам', 1),
('Будничные акции', 'Акции в будние дни', 1),
('Выходные акции', 'Акции в выходные дни', 1);

-- Вставка вложенных категорий для скидок
INSERT INTO categories (name, description, parent_id, level) VALUES
('Скидки на еду', 'Скидки на блюда', 35, 2),
('Скидки на напитки', 'Скидки на алкоголь и напитки', 35, 2),
('Скидки на услуги', 'Скидки на различные услуги', 35, 2);

-- Вставка категорий для достопримечательностей
INSERT INTO categories (name, description, level) VALUES
('Исторические места', 'Исторические достопримечательности', 1),
('Парки', 'Парки и скверы', 1),
('Музеи', 'Музеи и галереи', 1),
('Архитектура', 'Архитектурные памятники', 1),
('Природные красоты', 'Природные достопримечательности', 1);

-- Создание пользователя для базы данных (замените на свои данные)
-- CREATE USER 'city_guide_user'@'localhost' IDENTIFIED BY 'your_password_here';
-- GRANT ALL PRIVILEGES ON city_guide.* TO 'city_guide_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Вывод информации о созданной базе
SELECT 'База данных city_guide успешно создана!' as message;
SELECT COUNT(*) as total_categories FROM categories; 