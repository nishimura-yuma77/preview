#!/bin/sh
set -eu

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

# Prevent overlapping renewals, including manual invocations.
exec 9>/srv/certbot/renew.lock
flock -n 9 || exit 0

date -u '+%Y-%m-%dT%H:%M:%SZ Certificate renewal started'
docker compose --project-directory /srv -f /srv/compose.yaml run --rm -T certbot renew --non-interactive --no-random-sleep-on-renew
docker compose --project-directory /srv -f /srv/compose.yaml exec -T nginx nginx -t
docker compose --project-directory /srv -f /srv/compose.yaml exec -T nginx nginx -s reload
date -u '+%Y-%m-%dT%H:%M:%SZ Certificate renewal completed'
