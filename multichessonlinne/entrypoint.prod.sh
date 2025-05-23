# #!/usr/bin/env bash

# python manage.py collectstatic --noinput
# python manage.py migrate --noinput
# python -m gunicorn --bind 0.0.0.0:8000 --workers 3 multichessonlinne.wsgi:application
#!/bin/sh

set -e

# Ждем пока БД будет готова
echo "Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up - continuing"

# Применяем миграции и собираем статику
python manage.py migrate
python manage.py collectstatic --noinput

# Запускаем ASGI сервер
exec daphne -b 0.0.0.0 -p 8000 multichessonlinne.asgi:application