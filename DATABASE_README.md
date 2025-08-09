# База данных City Guide

База данных для системы заведений, мероприятий и акций города с поддержкой вложенных категорий.

## Структура базы данных

### Основные таблицы

1. **addresses** - Адреса (заведений, мероприятий, достопримечательностей)
2. **categories** - Категории с поддержкой вложенности
3. **establishments** - Заведения (рестораны, бары, клубы и т.д.)
4. **working_hours** - Часы работы заведений
5. **events** - Мероприятия и события
6. **promotions** - Акции и скидки
7. **attractions** - Достопримечательности
8. **images** - Изображения для всех сущностей
9. **reviews** - Отзывы пользователей

### Таблицы связей

- **establishment_categories** - Связь заведений с категориями
- **event_categories** - Связь мероприятий с категориями
- **promotion_categories** - Связь акций с категориями
- **attraction_categories** - Связь достопримечательностей с категориями

## Особенности архитектуры

### Вложенные категории
- Поддержка иерархических категорий (например: Рестораны → Азиатская кухня → Китайская кухня)
- Одна сущность может принадлежать к нескольким категориям одновременно
- Категории могут быть вложенными на любом уровне

### Гибкость адресов
- Один адрес может содержать несколько заведений
- Мероприятия могут проходить по разным адресам (не только в заведениях)
- Поддержка городских площадей и публичных пространств

### Часы работы
- Детальное расписание по дням недели
- Поддержка перерывов в работе
- Круглосуточные заведения
- Легкий поиск работающих сейчас заведений

### Временные ограничения
- Акции могут зависеть от времени, дней недели
- Поддержка будних/выходных акций
- JSON поля для гибких временных ограничений

## Установка и настройка

### 1. Создание базы данных
```bash
mysql -u root -p < database_schema.sql
```

### 2. Заполнение тестовыми данными
```bash
mysql -u root -p < sample_data.sql
```

### 3. Создание пользователя (опционально)
```sql
CREATE USER 'city_guide_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON city_guide.* TO 'city_guide_user'@'localhost';
FLUSH PRIVILEGES;
```

## Основные запросы

### Поиск работающих заведений
```sql
-- Используйте представление working_now
SELECT * FROM working_now;
```

### Поиск по категориям
```sql
-- Заведения с вложенными категориями
SELECT 
    e.name,
    GROUP_CONCAT(c.name ORDER BY c.level, c.name SEPARATOR ' → ') as categories
FROM establishments e
JOIN establishment_categories ec ON e.id = ec.establishment_id
JOIN categories c ON ec.category_id = c.id
GROUP BY e.id, e.name;
```

### Поиск активных акций
```sql
-- Используйте представление active_promotions
SELECT * FROM active_promotions;
```

## Примеры использования

### 1. Найти все рестораны китайской кухни
```sql
SELECT e.name, e.description, a.street, a.house_number
FROM establishments e
JOIN establishment_categories ec ON e.id = ec.establishment_id
JOIN categories c ON ec.category_id = c.id
JOIN addresses a ON e.address_id = a.id
WHERE c.name = 'Китайская кухня' AND e.is_active = TRUE;
```

### 2. Найти мероприятия на определенную дату
```sql
SELECT e.name, e.description, e.start_date, e.end_date, e.price
FROM events e
WHERE DATE(e.start_date) = '2024-02-15' AND e.is_active = TRUE;
```

### 3. Найти заведения с акциями в будни
```sql
SELECT e.name, p.name as promotion, p.discount_percent
FROM establishments e
JOIN promotions p ON e.id = p.establishment_id
WHERE p.is_weekday_only = TRUE AND p.is_active = TRUE;
```

### 4. Поиск по радиусу
```sql
-- Замените координаты на нужные
SET @center_lat = 55.7558;
SET @center_lng = 37.6176;
SET @radius_km = 5;

SELECT e.name, a.street,
    ROUND(6371 * acos(
        cos(radians(@center_lat)) * cos(radians(a.latitude)) * 
        cos(radians(a.longitude) - radians(@center_lng)) + 
        sin(radians(@center_lat)) * sin(radians(a.latitude))
    ), 2) as distance_km
FROM establishments e
JOIN addresses a ON e.address_id = a.id
WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
HAVING distance_km <= @radius_km;
```

## Индексы и оптимизация

База данных содержит оптимизированные индексы для:
- Поиска по городу и координатам
- Фильтрации по статусу активности
- Поиска по датам и времени
- Связей между таблицами

## Представления (Views)

### working_now
Показывает все работающие сейчас заведения с временем до закрытия.

### active_promotions
Показывает все активные акции с учетом временных ограничений.

## Расширение функциональности

### Добавление новых типов
- Новые типы мероприятий: добавьте в ENUM таблицы events
- Новые типы акций: добавьте в ENUM таблицы promotions
- Новые типы достопримечательностей: добавьте в ENUM таблицы attractions

### Добавление новых категорий
```sql
INSERT INTO categories (name, description, parent_id, level) VALUES
('Новая категория', 'Описание', parent_id, level);
```

### Добавление новых полей
База данных спроектирована с учетом расширяемости. Можно добавлять новые поля в существующие таблицы без нарушения структуры.

## Безопасность

- Все внешние ключи настроены с CASCADE для удаления связанных записей
- Проверки на уровне базы данных (CHECK constraints)
- Уникальные ключи для предотвращения дублирования связей

## Производительность

- Оптимизированные индексы для частых запросов
- Представления для сложных запросов
- Эффективная структура связей между таблицами

## Поддержка

База данных поддерживает:
- MySQL 5.7+
- MariaDB 10.2+
- UTF8MB4 кодировку для полной поддержки Unicode 