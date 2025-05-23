#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."
python manage.py check --database default > /dev/null 2>&1
while [ $? -ne 0 ]; do
  sleep 1
  python manage.py check --database default > /dev/null 2>&1
done
echo "PostgreSQL is up - continuing"

python manage.py migrate
python manage.py collectstatic --noinput

exec gunicorn multichessonlinne.wsgi:application --bind 0.0.0.0:8000