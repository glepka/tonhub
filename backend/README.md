# Backend API для Tonhub

Express.js сервер с Supabase для управления данными детейлинга.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Заполните переменные окружения в `.env`:
- `SUPABASE_URL` - URL вашего Supabase проекта
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key из настроек Supabase
- `PORT` - Порт для запуска сервера (по умолчанию 3000)

## Настройка базы данных

1. Откройте SQL Editor в Supabase Dashboard
2. Выполните SQL скрипт из `db/schema.sql` для создания всех таблиц

## Запуск

### Development режим (с автоперезагрузкой):
```bash
npm run dev
```

### Production режим:
```bash
npm start
```

Сервер будет доступен на `http://localhost:3000` (или указанном порте).

## API Endpoints

### Workers
- `GET /api/workers` - получить всех работников
- `POST /api/workers` - создать работника
- `PUT /api/workers/:id` - обновить работника
- `DELETE /api/workers/:id` - удалить работника

### Boxes
- `GET /api/boxes` - получить все боксы
- `POST /api/boxes` - создать бокс
- `PUT /api/boxes/:id` - обновить бокс
- `DELETE /api/boxes/:id` - удалить бокс

### Services
- `GET /api/services` - получить все услуги (с workerIds)
- `POST /api/services` - создать услугу
- `PUT /api/services/:id` - обновить услугу
- `DELETE /api/services/:id` - удалить услугу

### Bookings
- `GET /api/bookings` - получить все бронирования
- `GET /api/bookings?date=YYYY-MM-DD` - получить бронирования за дату
- `POST /api/bookings` - создать бронирование (с проверкой конфликтов)
- `PUT /api/bookings/:id` - обновить бронирование
- `DELETE /api/bookings/:id` - удалить бронирование

### Settings
- `GET /api/settings` - получить настройки
- `PUT /api/settings` - обновить/создать настройки

### Health Check
- `GET /health` - проверка работоспособности сервера

## Интеграция с фронтендом

Установите переменную окружения `VITE_API_URL` в `.env` фронтенда:
```
VITE_API_URL=http://localhost:3000/api
```

Или используйте дефолтное значение `http://localhost:3000/api`.

