#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-essentials-postgres}"
VOLUME_NAME="${VOLUME_NAME:-essentials-postgres-data}"
DB_NAME="${DB_NAME:-essentials}"
DB_USER="${DB_USER:-essentials}"
DB_PASSWORD="${DB_PASSWORD:-essentials}"
HOST_PORT="${HOST_PORT:-5432}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:16-alpine}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found."
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container ${CONTAINER_NAME} already exists. Starting it..."
  docker start "${CONTAINER_NAME}" >/dev/null
else
  echo "Creating docker volume ${VOLUME_NAME}..."
  docker volume create "${VOLUME_NAME}" >/dev/null

  echo "Starting ${CONTAINER_NAME} from ${POSTGRES_IMAGE}..."
  docker run -d \
    --name "${CONTAINER_NAME}" \
    -e POSTGRES_DB="${DB_NAME}" \
    -e POSTGRES_USER="${DB_USER}" \
    -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
    -p "${HOST_PORT}:5432" \
    -v "${VOLUME_NAME}:/var/lib/postgresql/data" \
    "${POSTGRES_IMAGE}" >/dev/null
fi

echo "Postgres is ready (container: ${CONTAINER_NAME}, port: ${HOST_PORT})."
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${HOST_PORT}/${DB_NAME}?schema=public"
