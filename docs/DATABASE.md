# 📚 Полная документация по базе данных городского гида

## 🎯 Обзор системы

База данных городского гида интегрирована в существующую систему Telegram бота и предоставляет полную функциональность для управления:
- **Заведениями** (рестораны, бары, клубы, кинотеатры, театры)
- **Событиями** (концерты, вечеринки, городские праздники)
- **Акциями и скидками** (временные и постоянные предложения)
- **Достопримечательностями** (парки, музеи, памятники)
- **Категориями** с поддержкой вложенности
- **Рабочими часами** заведений

## 🏗️ Архитектура базы данных

### Основные принципы:
- **Нормализация**: Минимизация дублирования данных
- **Гибкость**: Поддержка множественных категорий и связей
- **Производительность**: Оптимизированные индексы и представления
- **Масштабируемость**: Легкое добавление новых типов сущностей
- **Целостность**: Проверки на уровне базы данных

## 📊 Структура таблиц

### 1. Таблица `addresses` - Адреса

```sql
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
    is_public_space BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Назначение**: Хранение адресов для всех сущностей системы
**Особенности**: 
- Поддержка геолокации (координаты)
- Множественные заведения на одном адресе
- Поддержка публичных пространств (площади, парки)

### 2. Таблица `categories` - Категории

```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT NULL,
    level INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

**Назначение**: Иерархическая система категорий для всех типов сущностей
**Особенности**: 
- Поддержка вложенности через `parent_id` и `level`
- Каскадное удаление дочерних категорий
- Гибкая система уровней

**Примеры категорий**:
```
Ресторан (level 1)
├── Китайская кухня (level 2)
├── Итальянская кухня (level 2)
└── Лучшие рестораны (level 2)

Бар (level 1)
├── Коктейль-бар (level 2)
└── Пивной бар (level 2)
```

### 3. Таблица `establishments` - Заведения

```sql
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
```

**Назначение**: Основная информация о заведениях
**Особенности**: 
- Контактная информация и веб-сайт
- Связь с адресом (SET NULL при удалении адреса)
- Автоматическое обновление временных меток

### 4. Таблица `working_hours` - Рабочие часы

```sql
CREATE TABLE working_hours (
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
);
```

**Назначение**: Детальные рабочие часы для каждого заведения
**Особенности**:
- День недели: 1=понедельник, 7=воскресенье
- Поддержка перерывов
- Круглосуточная работа
- Уникальность по заведению и дню недели

### 5. Таблица `events` - События

```sql
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('concert', 'party', 'theater', 'cinema', 'festival', 'meeting', 'other') NOT NULL,
    establishment_id INT NULL,
    address_id INT NULL,
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
```

**Назначение**: События и мероприятия
**Особенности**:
- Может быть привязано к заведению ИЛИ адресу
- Различные типы событий
- Ценовая политика и ограничения участников
- Гибкая система привязки к локациям

### 6. Таблица `promotions` - Акции и скидки

```sql
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type ENUM('discount', 'special_offer', 'happy_hours', 'loyalty_program') NOT NULL,
    discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100),
    discount_amount DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    valid_days JSON,
    valid_hours JSON,
    establishment_id INT NULL,
    address_id INT NULL,
    is_permanent BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);
```

**Назначение**: Система акций, скидок и специальных предложений
**Особенности**:
- Процентные и фиксированные скидки
- Временные ограничения (даты, дни недели, часы)
- Постоянные и временные акции
- Привязка к заведению или адресу
- JSON поля для гибких временных ограничений

### 7. Таблица `attractions` - Достопримечательности

```sql
CREATE TABLE attractions (
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
);
```

**Назначение**: Достопримечательности и интересные места
**Особенности**:
- Различные типы достопримечательностей
- Информация о стоимости входа
- Рейтинговая система
- Описание режима работы

### 8. Таблица `images` - Изображения

```sql
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('establishment', 'event', 'promotion', 'attraction') NOT NULL,
    entity_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Назначение**: Хранение изображений для всех сущностей
**Особенности**: Поддержка множественных изображений, основное изображение

### 9. Таблица `reviews` - Отзывы

```sql
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('establishment', 'event', 'promotion', 'attraction') NOT NULL,
    entity_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Назначение**: Система отзывов пользователей
**Особенности**: Рейтинги и комментарии для всех типов сущностей

## 🔗 Связующие таблицы

### Таблицы связей с категориями

```sql
-- establishment_categories, event_categories, 
-- promotion_categories, attraction_categories
CREATE TABLE [entity]_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    [entity]_id INT NOT NULL,
    category_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ([entity]_id) REFERENCES [entities](id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_[entity]_category ([entity]_id, category_id)
);
```

**Назначение**: Связи многие-ко-многим между сущностями и категориями
**Особенности**: 
- Уникальность связей
- Каскадное удаление
- Основная категория для каждой сущности

## 👁️ Представления (Views)

### 1. `working_now` - Работающие сейчас заведения

```sql
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
```

**Назначение**: Быстрый поиск заведений, работающих в данный момент
**Возвращает**: ID, название, описание, время до закрытия, круглосуточность

### 2. `active_promotions` - Активные акции

```sql
CREATE VIEW active_promotions AS
SELECT 
    p.*,
    CASE 
        WHEN p.is_permanent = TRUE THEN TRUE
        WHEN p.start_date IS NULL AND p.end_date IS NULL THEN TRUE
        WHEN CURDATE() BETWEEN p.start_date AND p.end_date THEN TRUE
        ELSE FALSE
    END as is_currently_active
FROM promotions p
WHERE p.is_active = TRUE;
```

**Назначение**: Фильтрация активных акций по датам
**Возвращает**: Все поля акции + статус активности

## 📈 Индексы для производительности

```sql
-- Геолокация
CREATE INDEX idx_addresses_coordinates ON addresses(latitude, longitude);
CREATE INDEX idx_addresses_city ON addresses(city);

-- Заведения
CREATE INDEX idx_establishments_address ON establishments(address_id);
CREATE INDEX idx_establishments_active ON establishments(is_active);

-- Рабочие часы
CREATE INDEX idx_working_hours_day_time ON working_hours(day_of_week, open_time, close_time);
CREATE INDEX idx_working_hours_establishment ON working_hours(establishment_id, day_of_week);

-- События
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_establishment ON events(establishment_id);
CREATE INDEX idx_events_active ON events(is_active);

-- Акции
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_establishment ON promotions(establishment_id);
CREATE INDEX idx_promotions_active ON promotions(is_active);

-- Медиа и отзывы
CREATE INDEX idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX idx_reviews_entity ON reviews(entity_type, entity_id);
```

## 🔍 Примеры полезных запросов

### 1. Найти все работающие сейчас заведения

```sql
SELECT 
    e.name,
    e.description,
    a.street,
    a.house_number,
    wh.close_time,
    TIMEDIFF(wh.close_time, TIME(NOW())) as time_until_close
FROM working_now wn
JOIN establishments e ON wn.id = e.id
JOIN addresses a ON e.address_id = a.id
ORDER BY e.name;
```

### 2. Поиск заведений по категории с вложенностью

```sql
WITH RECURSIVE category_tree AS (
    SELECT id, name, parent_id, level
    FROM categories 
    WHERE name = 'Ресторан'
    
    UNION ALL
    
    SELECT c.id, c.name, c.parent_id, c.level
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT DISTINCT e.name, e.description, c.name as category
FROM establishments e
JOIN establishment_categories ec ON e.id = ec.establishment_id
JOIN category_tree c ON ec.category_id = c.id
WHERE e.is_active = TRUE;
```

### 3. Акции, действующие в определенное время

```sql
SELECT 
    p.name,
    p.description,
    p.discount_percent,
    e.name as establishment
FROM promotions p
JOIN establishments e ON p.establishment_id = e.id
WHERE p.is_active = TRUE
  AND JSON_CONTAINS(p.valid_days, CAST(WEEKDAY(NOW()) + 1 AS JSON))
  AND JSON_EXTRACT(p.valid_hours, '$.start') <= TIME(NOW())
  AND JSON_EXTRACT(p.valid_hours, '$.end') >= TIME(NOW());
```

### 4. Поиск ближайших заведений по координатам

```sql
SELECT 
    e.name,
    e.description,
    a.street,
    a.house_number,
    ROUND(
        6371 * acos(
            cos(radians(?)) * cos(radians(a.latitude)) * 
            cos(radians(a.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(a.latitude))
        ), 2
    ) AS distance_km
FROM establishments e
JOIN addresses a ON e.address_id = a.id
WHERE e.is_active = TRUE
  AND a.latitude IS NOT NULL 
  AND a.longitude IS NOT NULL
HAVING distance_km <= 5
ORDER BY distance_km;
```

### 5. Статистика по категориям

```sql
SELECT 
    c.name as category,
    COUNT(DISTINCT e.id) as establishments_count,
    AVG(e.rating) as avg_rating,
    COUNT(DISTINCT CASE WHEN e.price_range = 'expensive' THEN e.id END) as expensive_count
FROM categories c
LEFT JOIN establishment_categories ec ON c.id = ec.category_id
LEFT JOIN establishments e ON ec.establishment_id = e.id
WHERE c.entity_type = 'establishment' 
  AND c.level = 1
GROUP BY c.id, c.name
ORDER BY establishments_count DESC;
```

## 🚀 Миграции и развертывание

### Система миграций

Система миграций позволяет безопасно обновлять структуру базы данных без потери данных. Каждая миграция имеет методы `up()` для применения изменений и `down()` для отката.

### Файлы миграций
```
src/database/migrations/
├── 001_initial_schema.js      # Начальная схема (пользователи, логи)
├── 002_city_guide_schema.js   # Схема городского гида
└── migrate.js                  # Основной скрипт управления миграциями
```

### Выполнение миграций

```bash
# Выполнить все миграции
node src/database/migrate.js up

# Откатить все миграции
node src/database/migrate.js down
```

### Заполнение тестовыми данными

```bash
# Заполнить таблицы тестовыми данными
node src/database/seed_city_guide.js
```

## 🔧 Технические детали

### Версии и совместимость
- **MySQL**: 5.7+ / 8.0+
- **MariaDB**: 10.2+
- **Node.js**: 16+
- **Кодировка**: utf8mb4
- **Движок**: InnoDB

### Ограничения и проверки
- Рейтинги: 0-5
- Процент скидки: 0-100%
- Дни недели: 1-7
- Обязательные связи для событий и акций

### Безопасность
- Внешние ключи с каскадным удалением
- Проверки на уровне базы данных
- Уникальные ограничения для предотвращения дублирования

## 📝 Логирование и мониторинг

Все операции с базой данных логируются через систему логирования Telegram бота:
- Создание/удаление таблиц
- Выполнение миграций
- Ошибки подключения и запросов
- Успешные операции

## 🔮 Расширение функциональности

### Возможные дополнения:
1. **Отзывы и комментарии** - система рейтингов пользователей
2. **Фотографии** - медиа-контент для заведений и достопримечательностей
3. **Бронирование** - система резервирования столов/билетов
4. **Уведомления** - push-уведомления о событиях и акциях
5. **Аналитика** - статистика посещений и популярности

### Добавление новых типов сущностей:
1. Создать таблицу сущности
2. Добавить тип в ENUM `entity_type` таблицы `categories`
3. Создать связующую таблицу с категориями
4. Добавить в миграцию и сидер

## 📞 Поддержка и вопросы

При возникновении проблем:
1. Проверить логи системы
2. Убедиться в корректности конфигурации базы данных
3. Проверить выполнение миграций
4. Обратиться к документации по миграциям

## 📚 Связанные файлы

- `src/database/sql/database_schema.sql` - Полная схема базы данных
- `src/database/sql/useful_queries.sql` - Примеры полезных SQL запросов
- `src/database/sql/sample_data.sql` - Примеры данных в SQL формате
- `src/database/migrate.js` - Основной скрипт миграций
- `src/database/migrations/` - Файлы миграций
- `src/database/seeders/` - Сидеры для тестовых данных

---

*Полная документация по базе данных городского гида Telegram бота*
*Версия: 1.0 | Последнее обновление: Декабрь 2024*
*Объединено из всех файлов документации* 