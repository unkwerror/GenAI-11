# Архитектура Smart Calendar

Документ описывает устройство проекта, связь фронтенда и бэкенда, основные API и рекомендации по расширению микросервисов.

## 1. Общий обзор

- **Frontend (`Frontend/`)** — React + TypeScript + Vite. Отрисовывает календарь, задачи и AI-ассистента. Общается только с API Gateway.
- **Backend (`Backend/`)** — набор FastAPI-сервисов, объединённых `docker-compose.yml`. Сервисы используют общую базу PostgreSQL и Redis (для кеша/сессий), общие модели лежат в `Backend/shared`.
- **Инфраструктура** — `docker-compose.yml` поднимает Postgres, Redis, три бизнес-сервиса и API Gateway. В проде можно перенести конфигурацию в Kubernetes/ECS.

```
Frontend (Vite)  -->  API Gateway (8000)  -->  Auth (8001)
                                         \-->  Events (8002)
                                         \-->  Todos (8003)
Postgres  <-- shared SQLAlchemy models --> все сервисы
Redis     <-- опционально для кеша
```

## 2. Связь фронтенда и бэкенда

1. Пользователь работает в браузере (`npm run dev` → `http://localhost:3000`).
2. Клиентские запросы отправляются на `http://localhost:8000/api/...`.
3. API Gateway проксирует запрос к соответствующему микросервису:
   - `/api/auth/*` → `auth-service`
   - `/api/events/*` → `events-service`
   - `/api/todos/*` → `todos-service`
4. Авторизационные заголовки `Authorization: Bearer <token>` не изменяются: gateway просто добавляет их во внутренний вызов.
5. Ответ FastAPI сервиса возвращается напрямую во frontend. Таким образом UI зависит только от gateway и не знает о внутренних адресах.

## 3. API (через API Gateway)

Все эндпоинты начинаются с `/api`. Авторизация — JWT Access Token в заголовке `Authorization`.

### Аутентификация
| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/auth/register` | регистрация пользователя |
| `POST` | `/api/auth/login` | вход, выдача пары токенов |
| `POST` | `/api/auth/refresh` | обновление access/refresh |
| `GET` | `/api/auth/me` | текущий пользователь |
| `POST` | `/api/auth/logout` | статический ответ, клиент очищает токены |

### События календаря
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/events` | список событий текущего пользователя |
| `POST` | `/api/events` | создание события |
| `GET` | `/api/events/{id}` | чтение |
| `PUT` | `/api/events/{id}` | обновление |
| `DELETE` | `/api/events/{id}` | удаление |

### Задачи (Todos)
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/todos` | список задач |
| `POST` | `/api/todos` | создание |
| `GET` | `/api/todos/{id}` | чтение |
| `PUT` | `/api/todos/{id}` | обновление |
| `DELETE` | `/api/todos/{id}` | удаление |

## 4. Микросервисы

### API Gateway (`Backend/api-gateway`)
- FastAPI-приложение.
- Основные файлы:
  - `app/main.py` — создание приложения, добавление middlewares.
  - `app/api/routes/*.py` — публичные роуты `/api/*`.
  - `app/clients/*.py` — httpx-клиенты для общения с внутренними сервисами.
  - `app/core/config.py` — чтение переменных окружения (URL сервисов, тайм-ауты).
- Обрабатывает CORS, транслирует HTTP-коды (201/204 и т.д.).

### Auth Service (`Backend/auth-service`)
- Слои:
  - `app/api` — pydantic-схемы и роуты (`/register`, `/login`, `/me`).
  - `app/services/AuthService` — бизнес-логика регистрации/логина, выдача токенов.
  - `app/repositories/UserRepository` — SQLAlchemy-доступ к `shared.models.User`.
  - `app/core/config.py` — env настройки.
- Зависит от `shared/auth_utils.py` (bcrypt + JWT) и `shared/database.py`.

### Events Service (`Backend/events-service`)
- Пакет `app/` содержит:
  - `api/routes.py` — CRUD события.
  - `api/dependencies.py` — получение `EventService` и `AuthContext`.
  - `domain/schemas.py` — pydantic-модели запросов/ответов.
  - `repositories/event_repository.py` — работа с `shared.models.Event`.
  - `services/event_service.py` — бизнес-правила (валидация времени, CRUD).
  - `core/config.py` — базовые настройки.
- Использует `shared/security.py` для верификации JWT и подгрузки пользователя.

### Todos Service (`Backend/todos-service`)
- Аналогичная структура: `api`, `domain`, `repositories`, `services`, `core`.
- Работает с `shared.models.Todo`, проверяет права текущего пользователя.

### Shared (`Backend/shared`)
- `database.py` — создание SQLAlchemy engine/session.
- `models.py` — ORM-описание таблиц `users`, `events`, `todos`.
- `auth_utils.py` — JWT/пароли.
- `security.py` — единый helper `resolve_user_from_token`, возвращающий `AuthContext`.

### Инфраструктура
- `docker-compose.yml` — собирает контейнеры и соединяет их в сеть `calendar_network`.
- `requirements.txt` — зависимости Python-сервисов.
- `Backend/data/postgres` — volume для базы.

## 5. Добавление нового микросервиса

1. **Структура**  
   Создайте новую папку в `Backend/` со следующими подпапками:
   ```
   new-service/
     app/
       api/
       domain/
       repositories/
       services/
       core/
     Dockerfile
     main.py        # thin wrapper, импортирует app.main
   ```
   Повторите паттерн из `events-service` / `todos-service`.

2. **Shared зависимости**  
   - При необходимости добавьте модели в `shared/models.py`.
   - Используйте `shared/database.get_db` и, если требуется авторизация, `shared/security.resolve_user_from_token`.

3. **API слой**  
   - В `app/api/routes.py` опишите эндпоинты.
   - В `app/domain/schemas.py` — pydantic-схемы запросов/ответов.

4. **Бизнес-логика**  
   - Создайте `Service` класс, который использует репозиторий и инкапсулирует правила.
   - Репозиторий отвечает за SQLAlchemy операции.

5. **Dockerfile**  
   - Можно скопировать существующий Dockerfile из другого сервиса (uvicorn + requirements).

6. **Docker Compose**  
   - Добавьте новый сервис в `docker-compose.yml` (порт, image, переменные окружения, зависимости).

7. **API Gateway**  
   - Создайте httpx-клиент в `api-gateway/app/clients`.
   - Добавьте зависимости в `api-gateway/app/api/dependencies.py`.
   - Создайте роуты в `api-gateway/app/api/routes`.
   - Расширьте `app/core/config.py` новыми URL и переменными.

8. **Frontend**  
   - Добавьте функции в `Frontend/src/api.ts` или GraphQL клиент, чтобы вызывать новые эндпоинты.

9. **Документация и тесты**  
   - Опишите новый сервис в этом документе.
   - Добавьте smoke-тесты/pytest, если возможно.

## 6. Чек-лист разработчика

- `docker-compose up -d` из `Backend/` должен успешно стартовать все контейнеры.
- `http://localhost:8000/health` возвращает список внутренних сервисов.
- При логине фронтенд получает токены и использует их для всех запросов.
- Любые изменения в схемах должны отражаться и в `Frontend/src/api.ts`, и в документации.

Документ служит единым источником знаний о кодовой базе. Обновляйте его при структурных изменениях.


