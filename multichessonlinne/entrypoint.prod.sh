#!/bin/sh

set -e

# Ждем готовности PostgreSQL (добавьте эти строки)
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

python manage.py migrate
python manage.py collectstatic --noinput

exec gunicorn multichessonlinne.wsgi:application --bind 0.0.0.0:8000