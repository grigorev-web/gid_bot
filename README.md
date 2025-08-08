# 🤖 Telegram Bot с GigaChat интеграцией

Модульный Telegram бот с интеграцией GigaChat AI, chatGPT и базой данных MySQL.

## 📁 Структура проекта

```
├── src/
│   ├── bot/                    # Логика Telegram бота
│   │   ├── handlers/           # Обработчики сообщений и callback
│   │   ├── middleware/         # Промежуточное ПО
│   │   ├── utils/             # Утилиты для бота
│   │   └── commands/          # Команды бота
│   ├── gigachat/              # Логика GigaChat API
│   │   ├── services/          # Сервисы для работы с API
│   │   ├── models/            # Модели данных
│   │   └── utils/             # Утилиты для GigaChat
│   ├── database/              # Логика базы данных
│   │   ├── models/            # Модели данных
│   │   ├── migrations/        # Миграции БД
│   │   ├── seeders/           # Сидеры данных
│   │   └── connection/        # Подключение к БД
│   └── shared/                # Общие компоненты
│       └── logger/            # Система логирования
├── logs/                      # Логи приложения
├── config.js                  # Конфигурация
├── index.js                   # Точка входа
└── README.md                  # Документация
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка конфигурации

Скопируйте файл конфигурации и настройте параметры:

```bash
cp config.example.js config.js
```

Отредактируйте `config.js`:

```javascript
module.exports = {
    // Токен вашего Telegram бота
    BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
    
    // Authorization key для GigaChat
    GIGACHAT_AUTH_KEY: 'YOUR_AUTHORIZATION_KEY_HERE',
    
    // Настройки MySQL
    DATABASE: {
        HOST: 'your_mysql_host',
        PORT: 3306,
        USER: 'your_username',
        PASSWORD: 'your_password',
        NAME: 'telegram_bot_db'
    }
};
```

### 3. Инициализация базы данных

```bash
npm run migrate
```

### 4. Запуск бота

```bash
npm start
```

## 🔧 Конфигурация

### Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `config.js`

### GigaChat API

1. Зарегистрируйтесь на [GigaChat](https://developers.sber.ru/portal/products/gigachat)
2. Получите Authorization key
3. Добавьте ключ в `config.js`

### MySQL База данных

1. Создайте базу данных MySQL
2. Настройте параметры подключения в `config.js`
3. Запустите миграции: `npm run migrate`

## 📊 База данных

Проект использует MySQL для хранения данных:

### Таблицы

- **users** - Информация о пользователях
- **messages** - История сообщений и AI ответов

### Миграции

```bash
# Выполнить миграции
npm run migrate

# Откатить миграции
npm run migrate:down
```

## 🤖 Команды бота

- `/start` - Запуск бота
- `/help` - Справка
- `/ai_status` - Статус GigaChat
- `/stats` - Ваша статистика
- `/settings` - Настройки
- `/echo <текст>` - Эхо команда

## 🏗️ Архитектура

### Модульная структура

- **Bot Module** - Логика Telegram бота
- **GigaChat Module** - Интеграция с AI API
- **Database Module** - Работа с данными
- **Shared Module** - Общие компоненты

### Основные компоненты

#### Bot Module
- `MessageHandler` - Обработка сообщений
- `CallbackHandler` - Обработка callback запросов
- `Bot` - Основной класс бота

#### GigaChat Module
- `GigaChatService` - Сервис для работы с API
- Очередь запросов
- Кэширование токенов

#### Database Module
- `User` - Модель пользователя
- `Message` - Модель сообщения
- `Database` - Подключение к MySQL

#### Shared Module
- `Logger` - Система логирования

## 🔒 Безопасность

- Rate limiting для запросов
- Валидация входных данных
- Логирование всех операций
- Graceful shutdown

## 📈 Мониторинг

### Логирование

Логи сохраняются в:
- Консоль (цветной вывод)
- Файл `logs/bot.log`

### Статистика

Бот собирает статистику:
- Количество сообщений
- AI запросы
- Время ответа
- Активность пользователей

## 🛠️ Разработка

### Структура для добавления новых функций

1. **Новые команды**: `src/bot/commands/`
2. **Новые обработчики**: `src/bot/handlers/`
3. **Новые модели БД**: `src/database/models/`
4. **Новые миграции**: `src/database/migrations/`

### Пример добавления новой команды

```javascript
// src/bot/commands/new-command.js
class NewCommand {
    async execute(msg, bot) {
        // Логика команды
    }
}

// src/bot/handlers/message.handler.js
async handleNewCommand(msg, bot) {
    const newCommand = new NewCommand();
    await newCommand.execute(msg, bot);
}
```

## 🚀 Производительность

### Оптимизации

- Кэширование токенов GigaChat
- Очередь запросов
- Индексы в базе данных
- Graceful shutdown

### Мониторинг

- Время ответа AI
- Количество токенов
- Статистика использования

## 📝 Логирование

### Уровни логирования

- `debug` - Отладочная информация
- `info` - Общая информация
- `warn` - Предупреждения
- `error` - Ошибки

### Настройка

```javascript
// config.js
LOGGING: {
    LEVEL: 'info',
    FILE: {
        ENABLED: true,
        PATH: './logs/bot.log'
    }
}
```

## 🔧 Устранение неполадок

### Частые проблемы

1. **Ошибка SSL**: Уже решена в коде
2. **Ошибка токена**: Проверьте GIGACHAT_AUTH_KEY
3. **Ошибка БД**: Проверьте настройки MySQL и запустите миграции

### Логи

Проверьте логи в `logs/bot.log` для диагностики проблем.

## 📄 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте документацию
2. Посмотрите логи
3. Создайте Issue в репозитории

---

**Примечание**: Убедитесь, что у вас есть валидные токены для Telegram Bot API, GigaChat API и настроена MySQL база данных перед запуском. 