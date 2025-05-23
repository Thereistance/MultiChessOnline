#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."
until pg_isready -h db -U postgres; do
  sleep 1
done
echo "PostgreSQL is up - continuing"

python manage.py migrate
python manage.py collectstatic --noinput

exec daphne -b 0.0.0.0 -p 8000 multichessonlinne.asgi:application