# 🏗️ Архитектура Telegram Bot с GigaChat

## 📋 Общая схема

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram      │    │   GigaChat      │    │   MySQL         │
│   Bot API       │    │   API           │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Telegram Bot                                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        src/                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │    bot/     │  │  gigachat/  │  │ database/   │          │
│  │             │  │             │  │             │          │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │          │
│  │ │ handlers│ │  │ │services │ │  │ │ models  │ │          │
│  │ │         │ │  │ │         │ │  │ │         │ │          │
│  │ │ ┌─────┐ │ │  │ │ ┌─────┐ │ │  │ │ ┌─────┐ │ │          │
│  │ │ │message│ │ │  │ │GigaChat│ │ │  │ │ User │ │ │          │
│  │ │ │handler│ │ │  │ │Service │ │ │  │ │      │ │ │          │
│  │ │ └─────┘ │ │  │ │ └─────┘ │ │  │ │ └─────┘ │ │          │
│  │ │         │ │  │ │         │ │  │ │         │ │          │
│  │ │ ┌─────┐ │ │  │ │         │ │  │ │ ┌─────┐ │ │          │
│  │ │ │callback│ │ │  │         │ │  │ │ │Message│ │ │          │
│  │ │ │handler │ │ │  │         │ │  │ │ │      │ │ │          │
│  │ │ └─────┘ │ │  │ │         │ │  │ │ └─────┘ │ │          │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │          │
│  │             │  │             │  │             │          │
│  │ ┌─────────┐ │  │             │  │ ┌─────────┐ │          │
│  │ │ bot.js  │ │  │             │  │ │connection│ │          │
│  │ │         │ │  │             │  │ │         │ │          │
│  │ │ ┌─────┐ │ │  │             │  │ │ ┌─────┐ │ │          │
│  │ │ │ Bot │ │ │  │             │  │ │ │Database│ │ │          │
│  │ │ │Class │ │ │  │             │  │ │ │       │ │ │          │
│  │ │ └─────┘ │ │  │             │  │ │ └─────┘ │ │          │
│  │ └─────────┘ │  │             │  │ └─────────┘ │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   shared/   │  │  config.js  │  │  index.js   │          │
│  │             │  │             │  │             │          │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │          │
│  │ │ logger/ │ │  │ │ Bot     │ │  │ │ Main    │ │          │
│  │ │         │ │  │ │ Config  │ │  │ │ Entry   │ │          │
│  │ │ ┌─────┐ │ │  │ │         │ │  │ │ Point   │ │          │
│  │ │ │Logger│ │ │  │ │ ┌─────┐ │ │  │ │         │ │          │
│  │ │ │      │ │ │  │ │ │GigaChat│ │ │  │ ┌─────┐ │ │          │
│  │ │ └─────┘ │ │  │ │ │Config │ │ │  │ │ Bot  │ │ │          │
│  │ └─────────┘ │  │ │ └─────┘ │ │  │ │ │Init  │ │ │          │
│  │             │  │ │         │ │  │ │ └─────┘ │ │          │
│  │             │  │ │ ┌─────┐ │ │  │ │         │ │          │
│  │             │  │ │ │MySQL │ │ │  │ │ ┌─────┐ │ │          │
│  │             │  │ │ │Config│ │ │  │ │ │Graceful│ │ │          │
│  │             │  │ │ └─────┘ │ │  │ │ │Shutdown│ │ │          │
│  │             │  │ └─────────┘ │  │ │ └─────┘ │ │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Поток данных

### 1. Получение сообщения
```
Telegram API → Bot Class → Message Handler → Database
```

### 2. Обработка AI запроса
```
Message Handler → GigaChat Service → GigaChat API → Response
```

### 3. Сохранение контекста
```
GigaChat Response → Database (Message Model) → Context for next request
```

## 📁 Структура файлов

```
gid/
├── src/
│   ├── bot/
│   │   ├── bot.js                 # Основной класс бота
│   │   └── handlers/
│   │       ├── message.handler.js # Обработка сообщений
│   │       └── callback.handler.js # Обработка callback'ов
│   │
│   ├── gigachat/
│   │   └── services/
│   │       └── gigachat.service.js # Интеграция с GigaChat API
│   │
│   ├── database/
│   │   ├── connection/
│   │   │   └── database.js        # Подключение к MySQL
│   │   ├── models/
│   │   │   ├── User.js            # Модель пользователя
│   │   │   └── Message.js         # Модель сообщения
│   │   └── migrations/
│   │       └── 001_initial_schema.js # Схема БД
│   │
│   └── shared/
│       └── logger/
│           └── logger.js           # Централизованное логирование
│
├── config.js                       # Конфигурация
├── index.js                        # Точка входа
├── package.json                    # Зависимости
└── README.md                       # Документация
```

## 🗄️ База данных

### Таблица `users`
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'ru',
    is_bot BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INT DEFAULT 0,
    ai_requests_count INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    settings JSON
);
```

### Таблица `messages`
```sql
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    chat_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    is_ai_response BOOLEAN DEFAULT FALSE,
    ai_metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔧 Ключевые компоненты

### 1. **Bot Class** (`src/bot/bot.js`)
- Инициализация Telegram бота
- Управление жизненным циклом
- Подключение обработчиков

### 2. **Message Handler** (`src/bot/handlers/message.handler.js`)
- Обработка команд (`/start`, `/help`, `/stats`, `/settings`)
- Обработка обычных сообщений
- Формирование контекста для AI
- Сохранение в базу данных

### 3. **GigaChat Service** (`src/gigachat/services/gigachat.service.js`)
- Управление токенами доступа
- Отправка запросов к GigaChat API
- Очередь запросов
- Логирование контекста

### 4. **Database Connection** (`src/database/connection/database.js`)
- Singleton паттерн для подключения
- Автоматическое переподключение
- Транзакции и запросы

### 5. **Models** (`src/database/models/`)
- **User**: Управление пользователями
- **Message**: Управление сообщениями и контекстом

### 6. **Logger** (`src/shared/logger/logger.js`)
- Централизованное логирование
- Запись в файл и консоль
- Форматирование сообщений

## 🔄 Поток обработки сообщения

```
1. Пользователь отправляет сообщение
   ↓
2. Telegram API → Bot Class
   ↓
3. Message Handler получает сообщение
   ↓
4. Сохранение/обновление пользователя в БД
   ↓
5. Сохранение входящего сообщения в БД
   ↓
6. Получение истории сообщений (контекст)
   ↓
7. Формирование контекста для GigaChat
   ↓
8. Отправка запроса в GigaChat Service
   ↓
9. GigaChat API обрабатывает запрос
   ↓
10. Получение ответа от AI
    ↓
11. Сохранение AI ответа в БД
    ↓
12. Отправка ответа пользователю
    ↓
13. Логирование всех операций
```

## 🛡️ Безопасность

- Токены хранятся в `config.js`
- База данных защищена паролем
- Логирование всех операций
- Graceful shutdown при завершении

## 📊 Мониторинг

- Логирование всех запросов к GigaChat
- Статистика использования пользователей
- Отслеживание ошибок и исключений
- Мониторинг состояния базы данных

## 🚀 Развертывание

1. Установка зависимостей: `npm install`
2. Настройка конфигурации в `config.js`
3. Запуск миграций: `npm run migrate`
4. Запуск бота: `npm start`

Эта архитектура обеспечивает:
- ✅ Модульность и масштабируемость
- ✅ Надежное хранение данных
- ✅ Полное логирование операций
- ✅ Обработку ошибок
- ✅ Контекстное общение с AI 