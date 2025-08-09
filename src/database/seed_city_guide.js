const CityGuideSeeder = require('./seeders/city_guide_seeder');

async function seedCityGuide() {
    try {
        console.log('🌱 Запуск сидера городского гида...');
        
        const seeder = new CityGuideSeeder();
        await seeder.seed();
        
        console.log('✅ Сидер городского гида выполнен успешно!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Ошибка выполнения сидера:', error.message);
        process.exit(1);
    }
}

// Запуск сидера
seedCityGuide(); 