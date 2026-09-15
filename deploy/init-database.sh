#!/bin/sh
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v database_password="$POSTGRES_PASSWORD" <<'SQL'
CREATE ROLE templatev4_migrator LOGIN PASSWORD :'database_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE ROLE templatev4_api LOGIN PASSWORD :'database_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE ROLE templatev4_worker LOGIN PASSWORD :'database_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
ALTER DATABASE templatev4 OWNER TO templatev4_migrator;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL
