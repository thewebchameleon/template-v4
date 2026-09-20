#!/bin/sh
# Compatibility entry point. Use the source-build maintenance coordinator.
set -eu
repository="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
: "${COMPOSE_FILE:=compose.production.yaml}"
export COMPOSE_FILE
exec sh "$repository/deploy/private-module-deploy.sh"
