#!/bin/sh
# Run in the EasyPanel Compose build path, after fetching the release branch.
# EasyPanel and this command must not deploy concurrently.
set -eu
cd "$(dirname "$0")"
docker compose -f compose.yaml config --quiet
# Pull failures leave the currently running application untouched.
docker compose -f compose.yaml pull
docker compose -f compose.yaml stop web api worker
docker compose -f compose.yaml up -d --wait postgres
docker compose -f compose.yaml run --rm --no-deps key-permissions
# A fresh container runs on EVERY upgrade, including retries of the same release.
# A failure exits here with application workloads stopped.
docker compose -f compose.yaml run --rm --no-deps migrator
docker compose -f compose.yaml up -d --no-deps --wait api worker web
