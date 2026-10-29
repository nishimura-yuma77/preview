#!/bin/sh
set -eu

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH
export GIT_TERMINAL_PROMPT=0
GIT_SSH_COMMAND='ssh -o BatchMode=yes -o StrictHostKeyChecking=yes'
export GIT_SSH_COMMAND

# The dedicated SSH key is restricted to this command.
if [ -n "${SSH_CONNECTION:-}" ] && [ "${SSH_ORIGINAL_COMMAND:-}" != deploy ]; then
    printf '%s\n' 'Only the deploy command is allowed.' >&2
    exit 1
fi

exec 9>/srv/.git/deploy.lock
flock -w 300 9

if [ "$(git -C /srv branch --show-current)" != main ]; then
    printf '%s\n' 'Deployment requires the main branch.' >&2
    exit 1
fi

if [ -n "$(git -C /srv status --porcelain)" ]; then
    printf '%s\n' 'Deployment stopped: the server has uncommitted changes.' >&2
    exit 1
fi

# Pull the latest main, so a queued workflow cannot deploy an older revision.
git -C /srv pull --ff-only origin main
curl --fail --silent --show-error \
    --retry 5 --retry-all-errors --retry-delay 2 --max-time 20 \
    --output /dev/null https://jkdv1.net/
printf 'Deployed main: %s\n' "$(git -C /srv rev-parse HEAD)"
