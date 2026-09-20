#!/bin/sh
set -eu

repository="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$repository"
mkdir -p .local/backups
lock=.local/private-module-deploy.lock
if ! mkdir "$lock" 2>/dev/null; then echo "Another deployment is already running." >&2; exit 1; fi
trap 'rmdir "$lock"' EXIT

compose_file="${COMPOSE_FILE:-compose.production.yaml}"
compose_env_file="${COMPOSE_ENV_FILE:-.env}"
compose_project_directory="${COMPOSE_PROJECT_DIRECTORY:-$repository}"
compose() {
  if [ -f "$compose_env_file" ]; then docker compose --project-directory "$compose_project_directory" --env-file "$compose_env_file" -f "$compose_file" "$@"
  else docker compose --project-directory "$compose_project_directory" -f "$compose_file" "$@"
  fi
}
compose config --quiet
compose stop web api worker

# Resolve once before any image build. All Dockerfiles consume the same staged packages and manifest.
if [ -f "$compose_env_file" ]; then node --env-file="$compose_env_file" tools/private-modules.mjs prepare
else node tools/private-modules.mjs prepare
fi
compose build migrator api worker web
compose up -d --wait postgres

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup=".local/backups/templatev4-$stamp.dump"
compose exec -T postgres sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$backup"
test -s "$backup"

# --rm guarantees that an earlier successful migrator container cannot satisfy this deployment.
compose run --rm --no-deps migrator
compose up -d --no-deps --wait api worker web
cp .private-modules/client-template.json client-template.json
echo "Deployment complete. Database backup: $backup"
