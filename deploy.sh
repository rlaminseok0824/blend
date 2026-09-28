#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

docker compose build blend
docker compose up -d --no-deps --force-recreate blend

attempt=1
while [ "$attempt" -le 18 ]; do
  status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' blend 2>/dev/null || true)
  if [ "$status" = "healthy" ]; then
    network=$(docker inspect --format '{{if index .NetworkSettings.Networks "edge-net"}}connected{{end}}' blend)
    if [ "$network" != "connected" ]; then
      echo "Blend is not attached to edge-net." >&2
      exit 1
    fi
    echo "Blend deployment is healthy on edge-net."
    exit 0
  fi
  if [ "$status" = "unhealthy" ] || [ "$status" = "exited" ]; then
    docker logs --tail 100 blend >&2 || true
    echo "Blend deployment failed with status: $status" >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 5
done

docker logs --tail 100 blend >&2 || true
echo "Blend deployment did not become healthy in time." >&2
exit 1
