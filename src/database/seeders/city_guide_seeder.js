const Database = require('../connection/database');
const logger = require('../../shared/logger/logger');

class CityGuideSeeder {
    constructor() {
        this.db = Database;
    }

    async seed() {
        try {
            await this.db.connect();
            
            console.log('🌱 Начинаю заполнение таблиц городского гида...');
            
            // Добавление адресов
            await this.seedAddresses();
            
            // Добавление заведений
            await this.seedEstablishments();
            
            // Добавление рабочих часов
            await this.seedWorkingHours();
            
            // Добавление событий
            await this.seedEvents();
            
            // Добавление акций
            await this.seedPromotions();
            
            // Добавление достопримечательностей
            await this.seedAttractions();
            
            // Добавление связей с категориями
            await this.seedCategoryRelations();
            
            console.log('✅ Все таблицы городского гида заполнены успешно!');
            
        } catch (error) {
            console.error('❌ Ошибка заполнения таблиц:', error.message);
            logger.error(`Ошибка заполнения таблиц: ${error.message}`);
            throw error;
        } finally {
            await this.db.disconnect();
        }
    }

    async seedAddresses() {
        const addresses = [
            {
                street: 'Тверская улица',
                house_number: '1',
                city: 'Москва',
                postal_code: '125009',
                latitude: 55.7558,
                longitude: 37.6176
            },
            {
                street: 'Арбат',
                house_number: '15',
                city: 'Москва',
                postal_code: '119002',
                latitude: 55.7494,
                longitude: 37.5912
            },
            {
                street: 'Кутузовский проспект',
                house_number: '2/1',
                city: 'Москва',
                postal_code: '121248',
                latitude: 55.7445,
                longitude: 37.5364
            },
            {
                street: 'Покровка',
                house_number: '22',
                city: 'Москва',
                postal_code: '101000',
                latitude: 55.7558,
                longitude: 37.6496
            },
            {
                street: 'Никольская улица',
                house_number: '10',
                city: 'Москва',
                postal_code: '109012',
                latitude: 55.7565,
                longitude: 37.6214
            }
        ];

        for (const address of addresses) {
            await this.db.run(
                'INSERT INTO addresses (street, house_number, city, postal_code, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
                [address.street, address.house_number, address.city, address.postal_code, address.latitude, address.longitude]
            );
        }
        
        console.log('✅ Адреса добавлены');
    }

    async seedEstablishments() {
        const establishments = [
            {
                name: 'Ресторан "У Пушкина"',
                description: 'Элитный ресторан русской кухни в центре города',
                address_id: 1,
                phone: '+7(495)123-45-67',
                website: 'http://pushkin-rest.ru',
                email: 'info@pushkin-rest.ru',
                rating: 4.8,
                price_range: 'expensive'
            },
            {
                name: 'Бар "Красный"',
                description: 'Современный бар с авторскими коктейлями',
                address_id: 2,
                phone: '+7(495)234-56-78',
                website: 'http://redbar.ru',
                email: 'hello@redbar.ru',
                rating: 4.5,
                price_range: 'moderate'
            },
            {
                name: 'Ночной клуб "Электро"',
                description: 'Трендовый ночной клуб с электронной музыкой',
                address_id: 3,
                phone: '+7(495)345-67-89',
                website: 'http://electroclub.ru',
                email: 'info@electroclub.ru',
                rating: 4.3,
                price_range: 'expensive'
            },
            {
                name: 'Кинотеатр "Октябрь"',
                description: 'Современный кинотеатр с IMAX залом',
                address_id: 4,
                phone: '+7(495)456-78-90',
                website: 'http://oktyabr-cinema.ru',
                email: 'tickets@oktyabr-cinema.ru',
                rating: 4.6,
                price_range: 'moderate'
            },
            {
                name: 'Театр "Современник"',
                description: 'Известный драматический театр',
                address_id: 5,
                phone: '+7(495)567-89-01',
                website: 'http://sovremennik.ru',
                email: 'boxoffice@sovremennik.ru',
                rating: 4.7,
                price_range: 'moderate'
            }
        ];

        for (const establishment of establishments) {
            await this.db.run(
                'INSERT INTO establishments (name, description, address_id, phone, website, email, rating, price_range) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [establishment.name, establishment.description, establishment.address_id, establishment.phone, establishment.website, establishment.email, establishment.rating, establishment.price_range]
            );
        }
        
        console.log('✅ Заведения добавлены');
    }

    async seedWorkingHours() {
        const workingHours = [
            // Ресторан "У Пушкина" - работает каждый день с 12:00 до 23:00
            { establishment_id: 1, day_of_week: 1, open_time: '12:00:00', close_time: '23:00:00' },
            { establishment_id: 1, day_of_week: 2, open_time: '12:00:00', close_time: '23:00:00' },
            { establishment_id: 1, day_of_week: 3, open_time: '12:00:00', close_time: '23:00:00' },
            { establishment_id: 1, day_of_week: 4, open_time: '12:00:00', close_time: '23:00:00' },
            { establishment_id: 1, day_of_week: 5, open_time: '12:00:00', close_time: '23:00:00' },
            { establishment_id: 1, day_of_week: 6, open_time: '12:00:00', close_time: '23:00:00' },
            { establishment_id: 1, day_of_week: 7, open_time: '12:00:00', close_time: '23:00:00' },
            
            // Бар "Красный" - работает с 18:00 до 02:00
            { establishment_id: 2, day_of_week: 1, open_time: '18:00:00', close_time: '02:00:00' },
            { establishment_id: 2, day_of_week: 2, open_time: '18:00:00', close_time: '02:00:00' },
            { establishment_id: 2, day_of_week: 3, open_time: '18:00:00', close_time: '02:00:00' },
            { establishment_id: 2, day_of_week: 4, open_time: '18:00:00', close_time: '02:00:00' },
            { establishment_id: 2, day_of_week: 5, open_time: '18:00:00', close_time: '02:00:00' },
            { establishment_id: 2, day_of_week: 6, open_time: '18:00:00', close_time: '02:00:00' },
            { establishment_id: 2, day_of_week: 7, open_time: '18:00:00', close_time: '02:00:00' },
            
            // Ночной клуб "Электро" - работает только в выходные с 22:00 до 06:00
            { establishment_id: 3, day_of_week: 1, is_closed: true },
            { establishment_id: 3, day_of_week: 2, is_closed: true },
            { establishment_id: 3, day_of_week: 3, is_closed: true },
            { establishment_id: 3, day_of_week: 4, is_closed: true },
            { establishment_id: 3, day_of_week: 5, is_closed: true },
            { establishment_id: 3, day_of_week: 6, open_time: '22:00:00', close_time: '06:00:00' },
            { establishment_id: 3, day_of_week: 7, open_time: '22:00:00', close_time: '06:00:00' },
            
            // Кинотеатр "Октябрь" - работает каждый день с 10:00 до 00:00
            { establishment_id: 4, day_of_week: 1, open_time: '10:00:00', close_time: '00:00:00' },
            { establishment_id: 4, day_of_week: 2, open_time: '10:00:00', close_time: '00:00:00' },
            { establishment_id: 4, day_of_week: 3, open_time: '10:00:00', close_time: '00:00:00' },
            { establishment_id: 4, day_of_week: 4, open_time: '10:00:00', close_time: '00:00:00' },
            { establishment_id: 4, day_of_week: 5, open_time: '10:00:00', close_time: '00:00:00' },
            { establishment_id: 4, day_of_week: 6, open_time: '10:00:00', close_time: '00:00:00' },
            { establishment_id: 4, day_of_week: 7, open_time: '10:00:00', close_time: '00:00:00' },
            
            // Театр "Современник" - работает со вторника по воскресенье с 12:00 до 20:00
            { establishment_id: 5, day_of_week: 1, is_closed: true },
            { establishment_id: 5, day_of_week: 2, open_time: '12:00:00', close_time: '20:00:00' },
            { establishment_id: 5, day_of_week: 3, open_time: '12:00:00', close_time: '20:00:00' },
            { establishment_id: 5, day_of_week: 4, open_time: '12:00:00', close_time: '20:00:00' },
            { establishment_id: 5, day_of_week: 5, open_time: '12:00:00', close_time: '20:00:00' },
            { establishment_id: 5, day_of_week: 6, open_time: '12:00:00', close_time: '20:00:00' },
            { establishment_id: 5, day_of_week: 7, open_time: '12:00:00', close_time: '20:00:00' }
        ];

        for (const hours of workingHours) {
            if (hours.is_closed) {
                await this.db.run(
                    'INSERT INTO working_hours (establishment_id, day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?)',
                    [hours.establishment_id, hours.day_of_week, '00:00:00', '00:00:00', true]
                );
            } else {
                await this.db.run(
                    'INSERT INTO working_hours (establishment_id, day_of_week, open_time, close_time) VALUES (?, ?, ?, ?)',
                    [hours.establishment_id, hours.day_of_week, hours.open_time, hours.close_time]
                );
            }
        }
        
        console.log('✅ Рабочие часы добавлены');
    }

    async seedEvents() {
        const events = [
            {
                name: 'Концерт группы "Ленинград"',
                description: 'Большой концерт в поддержку нового альбома',
                event_type: 'concert',
                start_date: '2024-12-25 20:00:00',
                end_date: '2024-12-25 23:00:00',
                establishment_id: 3,
                address_id: null,
                price: 3000.00,
                max_participants: 500
            },
            {
                name: 'Новогодняя вечеринка',
                description: 'Грандиозная новогодняя вечеринка с диджеями',
                event_type: 'party',
                start_date: '2024-12-31 22:00:00',
                end_date: '2025-01-01 06:00:00',
                establishment_id: 3,
                address_id: null,
                price: 5000.00,
                max_participants: 800
            },
            {
                name: 'День города Москвы',
                description: 'Городской праздник с концертами и фейерверком',
                event_type: 'city_holiday',
                start_date: '2024-09-07 12:00:00',
                end_date: '2024-09-07 23:00:00',
                address_id: 1,
                establishment_id: null,
                price: 0.00,
                max_participants: null
            },
            {
                name: 'Премьера фильма "Мастер и Маргарита"',
                description: 'Премьерный показ новой экранизации',
                event_type: 'cinema',
                start_date: '2024-12-20 19:00:00',
                end_date: '2024-12-20 22:00:00',
                establishment_id: 4,
                address_id: null,
                price: 800.00,
                max_participants: null
            },
            {
                name: 'Спектакль "Горе от ума"',
                description: 'Классическая комедия Грибоедова',
                event_type: 'theater',
                start_date: '2024-12-28 19:00:00',
                end_date: '2024-12-28 22:00:00',
                establishment_id: 5,
                address_id: null,
                price: 2500.00,
                max_participants: null
            }
        ];

        for (const event of events) {
            await this.db.run(
                'INSERT INTO events (name, description, event_type, start_date, end_date, address_id, establishment_id, price, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [event.name, event.description, event.event_type, event.start_date, event.end_date, event.address_id, event.establishment_id, event.price, event.max_participants]
            );
        }
        
        console.log('✅ События добавлены');
    }

    async seedPromotions() {
        const promotions = [
            {
                name: 'Скидка 20% на все меню',
                description: 'Скидка на все блюда в будние дни с 12:00 до 16:00',
                promotion_type: 'discount',
                discount_percent: 20,
                discount_amount: null,
                start_date: '2024-12-01',
                end_date: '2024-12-31',
                valid_days: JSON.stringify([1, 2, 3, 4, 5]),
                valid_hours: JSON.stringify({ start: '12:00', end: '16:00' }),
                establishment_id: 1,
                address_id: null,
                is_permanent: false
            },
            {
                name: 'Happy Hours в баре',
                description: 'Скидка 50% на все коктейли с 18:00 до 20:00',
                promotion_type: 'happy_hours',
                discount_percent: 50,
                discount_amount: null,
                start_date: null,
                end_date: null,
                valid_days: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
                valid_hours: JSON.stringify({ start: '18:00', end: '20:00' }),
                establishment_id: 2,
                address_id: null,
                is_permanent: true
            },
            {
                name: 'Билеты в кино со скидкой',
                description: 'Скидка 30% на все сеансы в будние дни',
                promotion_type: 'discount',
                discount_percent: 30,
                discount_amount: null,
                start_date: null,
                end_date: null,
                valid_days: JSON.stringify([1, 2, 3, 4, 5]),
                valid_hours: null,
                establishment_id: 4,
                address_id: null,
                is_permanent: true
            },
            {
                name: 'Программа лояльности театра',
                description: 'Скидка 15% для постоянных зрителей',
                promotion_type: 'loyalty_program',
                discount_percent: 15,
                discount_amount: null,
                start_date: null,
                end_date: null,
                valid_days: null,
                valid_hours: null,
                establishment_id: 5,
                address_id: null,
                is_permanent: true
            }
        ];

        for (const promotion of promotions) {
            await this.db.run(
                'INSERT INTO promotions (name, description, promotion_type, discount_percent, discount_amount, start_date, end_date, valid_days, valid_hours, establishment_id, address_id, is_permanent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [promotion.name, promotion.description, promotion.promotion_type, promotion.discount_percent, promotion.discount_amount, promotion.start_date, promotion.end_date, promotion.valid_days, promotion.valid_hours, promotion.establishment_id, promotion.address_id, promotion.is_permanent]
            );
        }
        
        console.log('✅ Акции добавлены');
    }

    async seedAttractions() {
        const attractions = [
            {
                name: 'Красная площадь',
                description: 'Главная площадь Москвы, исторический центр города',
                attraction_type: 'landmark',
                address_id: 1,
                rating: 5.0,
                is_free: true,
                entry_fee: null,
                opening_hours: 'Круглосуточно'
            },
            {
                name: 'Парк Горького',
                description: 'Центральный парк культуры и отдыха',
                attraction_type: 'park',
                address_id: 2,
                rating: 4.7,
                is_free: true,
                entry_fee: null,
                opening_hours: '06:00 - 23:00'
            },
            {
                name: 'Третьяковская галерея',
                description: 'Художественный музей с богатой коллекцией русского искусства',
                attraction_type: 'museum',
                address_id: 3,
                rating: 4.8,
                is_free: false,
                entry_fee: 500.00,
                opening_hours: '10:00 - 18:00, выходной - понедельник'
            },
            {
                name: 'Памятник Минину и Пожарскому',
                description: 'Памятник народным героям на Красной площади',
                attraction_type: 'monument',
                address_id: 1,
                rating: 4.5,
                is_free: true,
                entry_fee: null,
                opening_hours: 'Круглосуточно'
            },
            {
                name: 'Смотровая площадка на Воробьевых горах',
                description: 'Панорамный вид на Москву с высоты птичьего полета',
                attraction_type: 'viewpoint',
                address_id: 4,
                rating: 4.9,
                is_free: true,
                entry_fee: null,
                opening_hours: 'Круглосуточно'
            }
        ];

        for (const attraction of attractions) {
            await this.db.run(
                'INSERT INTO attractions (name, description, attraction_type, address_id, rating, is_free, entry_fee, opening_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [attraction.name, attraction.description, attraction.attraction_type, attraction.address_id, attraction.rating, attraction.is_free, attraction.entry_fee, attraction.opening_hours]
            );
        }
        
        console.log('✅ Достопримечательности добавлены');
    }

    async seedCategoryRelations() {
        try {
            // Получаем ID категорий
            const categories = await this.db.all('SELECT id, name, entity_type FROM categories');
            
            // Связываем заведения с категориями
            const establishmentCategories = [
                { establishment_id: 1, category_name: 'Ресторан' },
                { establishment_id: 2, category_name: 'Бар' },
                { establishment_id: 3, category_name: 'Ночной клуб' },
                { establishment_id: 4, category_name: 'Кинотеатр' },
                { establishment_id: 5, category_name: 'Театр' }
            ];

            for (const ec of establishmentCategories) {
                const category = categories.find(c => c.name === ec.category_name && c.entity_type === 'establishment');
                if (category) {
                    await this.db.run(
                        'INSERT INTO establishment_categories (establishment_id, category_id) VALUES (?, ?)',
                        [ec.establishment_id, category.id]
                    );
                }
            }

            // Связываем события с категориями
            const eventCategories = [
                { event_id: 1, category_name: 'Концерт' },
                { event_id: 2, category_name: 'Вечеринка' },
                { event_id: 3, category_name: 'Городской праздник' },
                { event_id: 4, category_name: 'Кинотеатр' },
                { event_id: 5, category_name: 'Театр' }
            ];

            for (const ec of eventCategories) {
                const category = categories.find(c => c.name === ec.category_name && c.entity_type === 'event');
                if (category) {
                    await this.db.run(
                        'INSERT INTO event_categories (event_id, category_id) VALUES (?, ?)',
                        [ec.event_id, category.id]
                    );
                }
            }

            // Связываем акции с категориями
            const promotionCategories = [
                { promotion_id: 1, category_name: 'Скидка' },
                { promotion_id: 2, category_name: 'Happy Hours' },
                { promotion_id: 3, category_name: 'Скидка' },
                { promotion_id: 4, category_name: 'Программа лояльности' }
            ];

            for (const pc of promotionCategories) {
                const category = categories.find(c => c.name === pc.category_name && c.entity_type === 'promotion');
                if (category) {
                    await this.db.run(
                        'INSERT INTO promotion_categories (promotion_id, category_id) VALUES (?, ?)',
                        [pc.promotion_id, category.id]
                    );
                }
            }

            // Связываем достопримечательности с категориями
            const attractionCategories = [
                { attraction_id: 1, category_name: 'Достопримечательность' },
                { attraction_id: 2, category_name: 'Парк' },
                { attraction_id: 3, category_name: 'Музей' },
                { attraction_id: 4, category_name: 'Достопримечательность' },
                { attraction_id: 5, category_name: 'Смотровая площадка' }
            ];

            for (const ac of attractionCategories) {
                const category = categories.find(c => c.name === ac.category_name && c.entity_type === 'attraction');
                if (category) {
                    await this.db.run(
                        'INSERT INTO attraction_categories (attraction_id, category_id) VALUES (?, ?)',
                        [ac.attraction_id, category.id]
                    );
                }
            }

            console.log('✅ Связи с категориями добавлены');
        } catch (error) {
            console.log('ℹ️ Связи с категориями уже существуют или не могут быть добавлены');
        }
    }
}

module.exports = CityGuideSeeder; 