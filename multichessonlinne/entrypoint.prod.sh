#!/bin/sh

set -e

# Альтернативный способ проверки PostgreSQL без pg_isready
echo "Waiting for PostgreSQL..."
while ! python -c "import psycopg2; psycopg2.connect(dbname='multichessOnlineDB', user='postgres', password='maxjke114', host='db')" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up - continuing"

python manage.py migrate
python manage.py collectstatic --noinput

exec daphne -b 0.0.0.0 -p 8000 multichessonlinne.asgi:application