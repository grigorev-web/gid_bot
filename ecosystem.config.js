module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    // Дополнительные настройки для стабильности
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
    // Мониторинг
    pmx: true,
    // Переменные окружения
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}; 