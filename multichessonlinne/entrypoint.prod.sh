#!/bin/sh

set -e

# Ждем готовности PostgreSQL
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

# Применяем миграции
python manage.py migrate

# Собираем статику
python manage.py collectstatic --noinput

# Запускаем ASGI сервер (Daphne)
exec daphne -b 0.0.0.0 -p 8000 multichessonlinne.asgi:application