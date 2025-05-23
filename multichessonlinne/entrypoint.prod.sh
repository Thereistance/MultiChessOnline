#!/bin/sh

set -e

# Альтернативная проверка PostgreSQL без psql
echo "Waiting for PostgreSQL..."
until python -c "
import psycopg2
try:
    conn = psycopg2.connect(
        dbname='$POSTGRES_DB',
        user='$POSTGRES_USER',
        password='$POSTGRES_PASSWORD',
        host='db'
    )
    conn.close()
    exit(0)
except:
    exit(1)
" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up - continuing"

# Применяем миграции
python manage.py migrate

# Собираем статику
python manage.py collectstatic --noinput

# Запускаем ASGI сервер
exec daphne -b 0.0.0.0 -p 8000 multichessonlinne.asgi:application