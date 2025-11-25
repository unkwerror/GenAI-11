# 🚀 Backend микросервисов для Smart Calendar

Полная архитектура микросервисов с FastAPI, PostgreSQL, Redis и Docker.

## 📋 Структура проекта

```
Backend/
├── api-gateway/           # API Gateway (Fastapi) - порт 8000
├── auth-service/          # Аутентификация и авторизация - порт 8001
├── events-service/        # Управление событиями календаря - порт 8002
├── todos-service/         # Управление задачами - порт 8003
├── shared/                # Общие утилиты и модели
│   ├── models.py         # SQLAlchemy модели
│   ├── database.py       # Конфигурация БД
│   └── auth_utils.py     # JWT и Password handlers
├── requirements.txt       # Python зависимости
├── docker-compose.yml     # Docker Compose конфиг
└── .env                  # Переменные окружения
```

## 🛠️ Требования

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- Или **Python** 3.11+ (для локального запуска)
- **PostgreSQL** 15+ (если без Docker)

---

## 🚀 Быстрый запуск с Docker (рекомендуется)

### 1. Клонируйте репозиторий
```bash
cd /home/ikx/Desktop/GenAI-11
```

### 2. Запустите все сервисы
```bash
cd Backend
docker-compose up -d
```

### 3. Проверьте здоровье сервисов
```bash
curl http://localhost:8000/health
```

Результат:
```json
{
  "status": "API Gateway is running",
  "services": {
    "auth": "http://auth-service:8001/health",
    "events": "http://events-service:8002/health",
    "todos": "http://todos-service:8003/health"
  }
}
```

### 4. Остановите сервисы
```bash
docker-compose down
```

### 5. Очистите все данные
```bash
docker-compose down -v
```

---

## 🐍 Локальный запуск (без Docker)

### 1. Установите Python зависимости
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Установите PostgreSQL
```bash
# На Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# На macOS
brew install postgresql

# Запустите сервис
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

### 3. Создайте базу данных
```bash
sudo -u postgres psql
CREATE USER calendar_user WITH PASSWORD 'password123';
CREATE DATABASE calendar_db OWNER calendar_user;
\q
```

### 4. Запустите каждый сервис в отдельном терминале

**Терминал 1 - Auth Service:**
```bash
cd Backend/auth-service
python main.py
```

**Терминал 2 - Events Service:**
```bash
cd Backend/events-service
python main.py
```

**Терминал 3 - Todos Service:**
```bash
cd Backend/todos-service
python main.py
```

**Терминал 4 - API Gateway:**
```bash
cd Backend/api-gateway
python main.py
```

### 5. API будет доступен на `http://localhost:8000`

---

## 📡 API Endpoints

### 🔐 Аутентификация

**Регистрация:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "password": "secure_password"
  }'
```

**Ответ:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "is_active": true,
  "created_at": "2024-11-25T12:00:00"
}
```

**Логин:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

**Ответ:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Получить текущего пользователя:**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

### 📅 События

**Создать событие:**
```bash
curl -X POST http://localhost:8000/api/events \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Встреча с командой",
    "description": "Обсуждение проекта",
    "start_time": "2024-11-25T10:00:00",
    "end_time": "2024-11-25T11:30:00",
    "color": "#3b82f6",
    "source": "local",
    "reminder_enabled": true,
    "reminder_time": 15,
    "reminder_type": "notification"
  }'
```

**Получить все события:**
```bash
curl -X GET http://localhost:8000/api/events \
  -H "Authorization: Bearer <access_token>"
```

**Обновить событие:**
```bash
curl -X PUT http://localhost:8000/api/events/1 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Обновленное название"
  }'
```

**Удалить событие:**
```bash
curl -X DELETE http://localhost:8000/api/events/1 \
  -H "Authorization: Bearer <access_token>"
```

---

### ✅ Задачи

**Создать задачу:**
```bash
curl -X POST http://localhost:8000/api/todos \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Купить продукты",
    "priority": "high",
    "category": "day",
    "due_date": "2024-11-26T20:00:00"
  }'
```

**Получить все задачи:**
```bash
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer <access_token>"
```

**Обновить задачу:**
```bash
curl -X PUT http://localhost:8000/api/todos/1 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

**Удалить задачу:**
```bash
curl -X DELETE http://localhost:8000/api/todos/1 \
  -H "Authorization: Bearer <access_token>"
```

---

## 🔗 Подключение Фронтенда

В папке `Frontend/src/` создайте файл `api.ts`:

```typescript
const API_URL = 'http://localhost:8000/api';

class ApiClient {
  private accessToken: string | null = null;

  async register(email: string, username: string, password: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    this.accessToken = data.access_token;
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  }

  async getEvents() {
    const response = await fetch(`${API_URL}/events`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    return response.json();
  }

  async createEvent(event: any) {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(event)
    });
    return response.json();
  }

  async getTodos() {
    const response = await fetch(`${API_URL}/todos`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    return response.json();
  }

  async createTodo(todo: any) {
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(todo)
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

---

## 📊 Мониторинг и Логи

### Просмотр логов сервисов (Docker)
```bash
# Логи API Gateway
docker logs api_gateway -f

# Логи Auth Service
docker logs auth_service -f

# Логи Events Service
docker logs events_service -f

# Логи Todos Service
docker logs todos_service -f
```

### Подключение к БД
```bash
# Локально
psql -U calendar_user -d calendar_db -h localhost

# В Docker контейнере
docker exec -it calendar_db psql -U calendar_user -d calendar_db
```

---

## 🔧 Конфигурация

Отредактируйте `.env` файл для изменения параметров:

```env
# Database
DATABASE_URL=postgresql://calendar_user:password123@postgres:5432/calendar_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# Services
AUTH_SERVICE_URL=http://auth-service:8001
EVENTS_SERVICE_URL=http://events-service:8002
TODOS_SERVICE_URL=http://todos-service:8003
API_GATEWAY_URL=http://api-gateway:8000

# Environment
ENVIRONMENT=development
DEBUG=True
```

---

## 🐛 Решение проблем

### "Connection refused" при обращении к микросервисам
Убедитесь, что все сервисы запущены:
```bash
docker-compose ps
```

### "Database connection error"
Проверьте, что PostgreSQL работает:
```bash
docker exec calendar_db pg_isready -U calendar_user
```

### Сбросить всё и начать заново
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

---

## 📝 Лицензия

MIT License

---

## 👥 Контакты

Для вопросов и помощи создавайте Issues в репозитории.
