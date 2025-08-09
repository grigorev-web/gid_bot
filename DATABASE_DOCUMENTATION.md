# 📚 Документация по базе данных городского гида

## 🎯 Обзор

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

## 📊 Структура таблиц

### 1. Таблица `addresses` - Адреса

```sql
CREATE TABLE addresses (
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
);
```

**Назначение**: Хранение адресов для всех сущностей системы
**Особенности**: Поддержка геолокации (координаты), множественные заведения на одном адресе

### 2. Таблица `categories` - Категории

```sql
CREATE TABLE categories (
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
);
```

**Назначение**: Иерархическая система категорий для всех типов сущностей
**Особенности**: 
- Поддержка вложенности через `parent_id` и `level`
- Разделение по типам сущностей
- Каскадное удаление дочерних категорий

**Примеры категорий**:
```
Ресторан (level 1)
├── Китайская кухня (level 2)
├── Итальянская кухня (level 2)
└── Лучшие рестораны (level 2)
```

### 3. Таблица `establishments` - Заведения

```sql
CREATE TABLE establishments (
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
);
```

**Назначение**: Основная информация о заведениях
**Особенности**: 
- Рейтинговая система (0-5)
- Категории цен (бюджет, умеренно, дорого, люкс)
- Связь с адресом (каскадное удаление)

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
);
```

**Назначение**: События и мероприятия
**Особенности**:
- Может быть привязано к заведению ИЛИ адресу
- Различные типы событий
- Ценовая политика и ограничения участников
- Проверка на обязательность одной из связей

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
);
```

**Назначение**: Система акций, скидок и специальных предложений
**Особенности**:
- Процентные и фиксированные скидки
- Временные ограничения (даты, дни недели, часы)
- Постоянные и временные акции
- Привязка к заведению или адресу

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

## 🔗 Связующие таблицы

### 8-11. Таблицы связей с категориями

```sql
-- establishment_categories, event_categories, 
-- promotion_categories, attraction_categories
CREATE TABLE [entity]_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    [entity]_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ([entity]_id) REFERENCES [entities](id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_[entity]_category ([entity]_id, category_id)
);
```

**Назначение**: Связи многие-ко-многим между сущностями и категориями
**Особенности**: Уникальность связей, каскадное удаление

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

-- Категории
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_entity_type ON categories(entity_type);
CREATE INDEX idx_categories_level ON categories(level);

-- Заведения
CREATE INDEX idx_establishments_address_id ON establishments(address_id);
CREATE INDEX idx_establishments_rating ON establishments(rating);
CREATE INDEX idx_establishments_is_active ON establishments(is_active);

-- События
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);
CREATE INDEX idx_events_establishment_id ON events(establishment_id);

-- Рабочие часы
CREATE INDEX idx_working_hours_day_time ON working_hours(day_of_week, open_time, close_time);
CREATE INDEX idx_working_hours_establishment ON working_hours(establishment_id);
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
    WHERE name = 'Ресторан' AND entity_type = 'establishment'
    
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
- **MySQL**: 8.0+
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
4. Обратиться к документации по миграциям (`MIGRATION_README.md`)

---

*Документация создана для системы городского гида Telegram бота*
*Версия: 1.0 | Последнее обновление: Декабрь 2024* 