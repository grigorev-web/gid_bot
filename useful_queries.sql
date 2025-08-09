-- Полезные SQL-запросы для работы с базой данных city_guide

-- 1. Найти все работающие сейчас заведения
SELECT 
    e.name,
    e.description,
    a.street,
    a.house_number,
    a.city,
    wh.close_time,
    TIMEDIFF(wh.close_time, TIME(NOW())) as time_until_close,
    wh.is_24h
FROM establishments e
JOIN working_hours wh ON e.id = wh.establishment_id
JOIN addresses a ON e.address_id = a.id
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
ORDER BY e.name;

-- 2. Найти заведения по категории с вложенностью
SELECT 
    e.name,
    e.description,
    c.name as category_name,
    c.level,
    pc.name as parent_category
FROM establishments e
JOIN establishment_categories ec ON e.id = ec.establishment_id
JOIN categories c ON ec.category_id = c.id
LEFT JOIN categories pc ON c.parent_id = pc.id
WHERE c.name LIKE '%ресторан%' OR pc.name LIKE '%ресторан%'
ORDER BY c.level, e.name;

-- 3. Найти все мероприятия на сегодня
SELECT 
    e.name,
    e.description,
    e.start_date,
    e.end_date,
    e.price,
    est.name as establishment_name,
    a.street,
    a.house_number,
    a.city
FROM events e
LEFT JOIN establishments est ON e.establishment_id = est.id
LEFT JOIN addresses a ON e.address_id = a.id
WHERE DATE(e.start_date) = CURDATE()
  AND e.is_active = TRUE
ORDER BY e.start_date;

-- 4. Найти активные акции по категориям
SELECT 
    p.name,
    p.description,
    p.discount_percent,
    p.discount_amount,
    p.start_date,
    p.end_date,
    est.name as establishment_name,
    c.name as category_name
FROM promotions p
LEFT JOIN establishments est ON p.establishment_id = est.id
LEFT JOIN promotion_categories pc ON p.id = pc.promotion_id
LEFT JOIN categories c ON pc.category_id = c.id
WHERE p.is_active = TRUE
  AND CURDATE() BETWEEN p.start_date AND p.end_date
ORDER BY p.start_date;

-- 5. Найти заведения с их категориями (включая вложенные)
SELECT 
    e.name,
    e.description,
    GROUP_CONCAT(
        CASE 
            WHEN c.level = 1 THEN c.name
            WHEN c.level = 2 THEN CONCAT(pc.name, ' → ', c.name)
            WHEN c.level = 3 THEN CONCAT(ppc.name, ' → ', pc.name, ' → ', c.name)
        END
        ORDER BY c.level, c.name
        SEPARATOR ' | '
    ) as categories
FROM establishments e
JOIN establishment_categories ec ON e.id = ec.establishment_id
JOIN categories c ON ec.category_id = c.id
LEFT JOIN categories pc ON c.parent_id = pc.id
LEFT JOIN categories ppc ON pc.parent_id = ppc.id
WHERE e.is_active = TRUE
GROUP BY e.id, e.name, e.description
ORDER BY e.name;

-- 6. Найти все мероприятия по адресу (включая городские)
SELECT 
    e.name,
    e.description,
    e.event_type,
    e.start_date,
    e.end_date,
    e.price,
    est.name as establishment_name,
    a.street,
    a.house_number,
    a.city,
    CASE 
        WHEN e.establishment_id IS NULL THEN 'Городское мероприятие'
        ELSE 'В заведении'
    END as event_location_type
FROM events e
LEFT JOIN establishments est ON e.establishment_id = est.id
LEFT JOIN addresses a ON e.address_id = a.id
WHERE a.city = 'Москва'
  AND e.is_active = TRUE
ORDER BY e.start_date;

-- 7. Найти заведения с акциями по дням недели
SELECT 
    e.name,
    p.name as promotion_name,
    p.discount_percent,
    p.discount_amount,
    p.valid_days,
    p.valid_hours,
    p.is_weekday_only,
    p.is_weekend_only
FROM establishments e
JOIN promotions p ON e.id = p.establishment_id
WHERE p.is_active = TRUE
  AND CURDATE() BETWEEN p.start_date AND p.end_date
ORDER BY e.name, p.name;

-- 8. Найти достопримечательности по категориям
SELECT 
    att.name,
    att.description,
    att.attraction_type,
    att.best_visit_time,
    att.is_free,
    att.entrance_fee,
    a.street,
    a.house_number,
    a.city,
    GROUP_CONCAT(c.name ORDER BY c.level, c.name SEPARATOR ' | ') as categories
FROM attractions att
JOIN addresses a ON att.address_id = a.id
LEFT JOIN attraction_categories ac ON att.id = ac.attraction_id
LEFT JOIN categories c ON ac.category_id = c.id
GROUP BY att.id, att.name, att.description, att.attraction_type, att.best_visit_time, att.is_free, att.entrance_fee, a.street, a.house_number, a.city
ORDER BY att.name;

-- 9. Найти заведения с отзывами и рейтингом
SELECT 
    e.name,
    e.description,
    COUNT(r.id) as total_reviews,
    AVG(r.rating) as avg_rating,
    MIN(r.rating) as min_rating,
    MAX(r.rating) as max_rating
FROM establishments e
LEFT JOIN reviews r ON e.id = r.entity_id AND r.entity_type = 'establishment'
WHERE e.is_active = TRUE
GROUP BY e.id, e.name, e.description
HAVING total_reviews > 0
ORDER BY avg_rating DESC;

-- 10. Найти все адреса с количеством заведений
SELECT 
    a.street,
    a.house_number,
    a.city,
    a.region,
    a.is_public_space,
    COUNT(e.id) as establishments_count,
    GROUP_CONCAT(e.name ORDER BY e.name SEPARATOR ', ') as establishment_names
FROM addresses a
LEFT JOIN establishments e ON a.id = e.address_id
GROUP BY a.id, a.street, a.house_number, a.city, a.region, a.is_public_space
ORDER BY establishments_count DESC, a.city, a.street;

-- 11. Найти заведения по радиусу от определенной точки
-- Замените координаты на нужные (например, центр Москвы)
SET @center_lat = 55.7558;
SET @center_lng = 37.6176;
SET @radius_km = 5;

SELECT 
    e.name,
    e.description,
    a.street,
    a.house_number,
    a.city,
    ROUND(
        6371 * acos(
            cos(radians(@center_lat)) * cos(radians(a.latitude)) * 
            cos(radians(a.longitude) - radians(@center_lng)) + 
            sin(radians(@center_lat)) * sin(radians(a.latitude))
        ), 2
    ) as distance_km
FROM establishments e
JOIN addresses a ON e.address_id = a.id
WHERE a.latitude IS NOT NULL 
  AND a.longitude IS NOT NULL
  AND e.is_active = TRUE
HAVING distance_km <= @radius_km
ORDER BY distance_km;

-- 12. Найти мероприятия по временному диапазону
SELECT 
    e.name,
    e.description,
    e.event_type,
    e.start_date,
    e.end_date,
    e.price,
    est.name as establishment_name,
    a.street,
    a.house_number,
    a.city
FROM events e
LEFT JOIN establishments est ON e.establishment_id = est.id
LEFT JOIN addresses a ON e.address_id = a.id
WHERE e.start_date BETWEEN '2024-02-01 00:00:00' AND '2024-02-29 23:59:59'
  AND e.is_active = TRUE
ORDER BY e.start_date;

-- 13. Найти заведения с определенными часами работы
SELECT 
    e.name,
    e.description,
    wh.day_of_week,
    wh.open_time,
    wh.close_time,
    wh.is_24h
FROM establishments e
JOIN working_hours wh ON e.id = wh.establishment_id
WHERE wh.open_time <= '12:00:00'  -- открывается до 12:00
  AND wh.close_time >= '22:00:00' -- закрывается после 22:00
  AND e.is_active = TRUE
ORDER BY e.name, wh.day_of_week;

-- 14. Статистика по категориям
SELECT 
    c.name as category_name,
    c.level,
    pc.name as parent_category,
    COUNT(DISTINCT ec.establishment_id) as establishments_count,
    COUNT(DISTINCT evc.event_id) as events_count,
    COUNT(DISTINCT pc2.promotion_id) as promotions_count
FROM categories c
LEFT JOIN categories pc ON c.parent_id = pc.id
LEFT JOIN establishment_categories ec ON c.id = ec.category_id
LEFT JOIN event_categories evc ON c.id = evc.category_id
LEFT JOIN promotion_categories pc2 ON c.id = pc2.category_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.level, pc.name
ORDER BY c.level, c.name;

-- 15. Найти заведения с наибольшим количеством категорий
SELECT 
    e.name,
    e.description,
    COUNT(ec.category_id) as categories_count,
    GROUP_CONCAT(c.name ORDER BY c.level, c.name SEPARATOR ' | ') as categories
FROM establishments e
JOIN establishment_categories ec ON e.id = ec.establishment_id
JOIN categories c ON ec.category_id = c.id
WHERE e.is_active = TRUE
GROUP BY e.id, e.name, e.description
HAVING categories_count > 1
ORDER BY categories_count DESC, e.name; 