// Скопируйте этот код в консоль браузера на странице Яндекс Карт
// Убедитесь что ваш сервер запущен на выделенном сервере

(function() {
    'use strict';
    
    // УКАЖИТЕ IP АДРЕС ВАШЕГО СЕРВЕРА
    const SERVER_IP = '46.173.27.12'; // Например: '123.45.67.89'
    const SERVER_PORT = '443'; // Порт сервера
    const SERVER_URL = `https://${SERVER_IP}:${SERVER_PORT}/receive_data`;
    
    console.log('🚀 Яндекс Карты перехватчик активирован!');
    console.log('📡 Отправляем данные на:', SERVER_URL);
    console.log('⚠️  Убедитесь что указан правильный IP сервера в переменной SERVER_IP');
    
    // Перехватываем fetch запросы
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        
        // Фильтруем только запросы к API Яндекс Карт
        if (typeof url === 'string' && (
            url.includes('/maps/api/search?') //|| 
            //url.includes('api-maps.yandex.ru') ||
           // url.includes('search-maps.yandex.ru')
        )) {
            console.log('🔍 Перехвачен запрос к Яндекс Картам:', url);
            
            // Перехватываем ответ
            return originalFetch.apply(this, args).then(response => {
                const clonedResponse = response.clone();
                
                // Читаем тело ответа
                clonedResponse.text().then(text => {
                    try {
                        const data = {
                            timestamp: new Date().toISOString(),
                            url: url,
                            method: args[1]?.method || 'GET',
                            headers: args[1]?.headers || {},
                            body: args[1]?.body || null,
                            response: text,
                            responseHeaders: Object.fromEntries(response.headers.entries())
                        };
                        
                        // Отправляем данные на наш сервер
                        fetch(SERVER_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        })
                        .then(serverResponse => serverResponse.json())
                        .then(result => {
                            console.log('✅ Данные отправлены на сервер:', result);
                        })
                        .catch(error => {
                            console.error('❌ Ошибка отправки на сервер:', error);
                            console.log('🔧 Проверьте:');
                            console.log('   - Правильность IP адреса сервера');
                            console.log('   - Работает ли сервер');
                            console.log('   - Открыт ли порт 5000');
                        });
                        
                    } catch (error) {
                        console.error('❌ Ошибка обработки ответа:', error);
                    }
                });
                
                return response;
            });
        }
        
        return originalFetch.apply(this, args);
    };
    
    // Перехватываем XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._method = method;
        this._url = url;
        return originalXHROpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(data) {
        const xhr = this;
        const url = this._url;
        const method = this._method;
        
        // Фильтруем только запросы к API Яндекс Карт
        if (typeof url === 'string' && (
            url.includes('maps.yandex.ru') || 
            url.includes('api-maps.yandex.ru') ||
            url.includes('search-maps.yandex.ru')
        )) {
            console.log('🔍 Перехвачен XHR запрос к Яндекс Картам:', url);
            
            // Перехватываем ответ
            const originalOnReadyStateChange = xhr.onreadystatechange;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    try {
                        const responseData = {
                            timestamp: new Date().toISOString(),
                            url: url,
                            method: method,
                            requestData: data,
                            response: xhr.responseText,
                            status: xhr.status,
                            statusText: xhr.statusText,
                            responseHeaders: xhr.getAllResponseHeaders()
                        };
                        
                        // Отправляем данные на наш сервер
                        fetch(SERVER_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(responseData)
                        })
                        .then(serverResponse => serverResponse.json())
                        .then(result => {
                            console.log('✅ XHR данные отправлены на сервер:', result);
                        })
                        .catch(error => {
                            console.error('❌ Ошибка отправки XHR данных на сервер:', error);
                        });
                        
                    } catch (error) {
                        console.error('❌ Ошибка обработки XHR ответа:', error);
                    }
                }
                
                if (originalOnReadyStateChange) {
                    originalOnReadyStateChange.apply(xhr, arguments);
                }
            };
        }
        
        return originalXHRSend.apply(this, [data]);
    };
    
    console.log('✅ Перехватчик успешно установлен!');
    console.log('💡 Теперь переходите по картам и ищите рестораны - все запросы будут перехвачены');
    console.log('🔧 Для изменения IP сервера отредактируйте переменную SERVER_IP в начале скрипта');
    
})(); 