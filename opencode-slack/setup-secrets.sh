#!/usr/bin/env bash
set -euo pipefail

secrets=/srv/opencode-slack/secrets.env
if [[ -e "$secrets" || -L "$secrets" ]]; then
  printf 'secrets.env already exists; refusing to overwrite it.\n' >&2
  exit 1
fi

IFS= read -r -s -p 'Slack App-Level Token (xapp-): ' app_token </dev/tty
printf '\n' >/dev/tty
IFS= read -r -s -p 'Slack Bot Token (xoxb-): ' bot_token </dev/tty
printf '\n' >/dev/tty
if [[ ! "$app_token" =~ ^xapp-[A-Za-z0-9_-]+$ || ! "$bot_token" =~ ^xoxb-[A-Za-z0-9_-]+$ ]]; then
  printf 'Unexpected token format.\n' >&2
  exit 1
fi

umask 077
set -o noclobber
password=$(openssl rand -hex 32)
printf 'SLACK_APP_TOKEN=%s\nSLACK_BOT_TOKEN=%s\nOPENCODE_SERVER_PASSWORD=%s\n' \
  "$app_token" "$bot_token" "$password" > "$secrets"
printf 'Saved secrets with owner-only permissions.\n'
