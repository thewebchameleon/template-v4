#!/bin/sh
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v migrator_password="$MIGRATOR_PASSWORD" \
  -v api_password="$API_PASSWORD" \
  -v worker_password="$WORKER_PASSWORD" <<'SQL'
CREATE ROLE templatev4_migrator LOGIN PASSWORD :'migrator_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE ROLE templatev4_api LOGIN PASSWORD :'api_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE ROLE templatev4_worker LOGIN PASSWORD :'worker_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
ALTER DATABASE templatev4 OWNER TO templatev4_migrator;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL
