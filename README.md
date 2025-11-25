# Smart Calendar

Приложение умного календаря из фронтенда на React и Python-бэкенда из нескольких микросервисов.

## Быстрый старт
```bash
cd Backend
docker-compose up -d        # поднимает Postgres, Redis и все сервисы

cd ../Frontend
npm install
npm run dev                 # http://localhost:3000
```

API Gateway доступен на `http://localhost:8000`, документация в `docs/`.

## Структура репозитория
- `Backend/` — FastAPI микросервисы, общий код и Docker Compose.
- `Frontend/` — клиент на React + Vite.
- `docs/` — архитектура, описание API и гайд по расширению.

## Документация
Подробные схемы, список эндпоинтов и инструкция по добавлению новых сервисов находятся в `docs/architecture.md`.


