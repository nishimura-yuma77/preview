#!/usr/bin/env bash
set -euo pipefail
umask 022

if [[ $# -ne 1 || ! -d "$1" ]]; then
    printf 'Usage: %s /path/to/repository-or-worktree\n' "$0" >&2
    exit 1
fi

project="$(realpath -- "$1")"
server_root="$(realpath -- "$(dirname -- "${BASH_SOURCE[0]}")/..")"
storybook_root="$server_root/storybook"
releases="$storybook_root/releases"

node -e '
    const { readFileSync } = require("node:fs");
    const pkg = JSON.parse(readFileSync(process.argv[1], "utf8"));
    if (!pkg.scripts?.["build-storybook"]) throw new Error("Missing build-storybook script");
' "$project/package.json"

mkdir -p -- "$releases"
exec 9>"$storybook_root/.deploy.lock"
flock -w 300 9

if [[ -e "$storybook_root/current" && ! -L "$storybook_root/current" ]]; then
    printf '%s\n' 'The current deployment must be a symlink.' >&2
    exit 1
fi

staging="$(mktemp -d "$releases/.build-XXXXXXXX")"
next="$storybook_root/.current-next-$$"
cleanup() {
    if [[ -n "$staging" ]]; then rm -rf -- "$staging"; fi
    rm -f -- "$next"
}
trap cleanup EXIT

npm --prefix "$project" run build-storybook -- --output-dir "$staging"
for file in index.html iframe.html index.json; do
    if [[ ! -s "$staging/$file" ]]; then
        printf 'Missing or empty Storybook artifact: %s\n' "$file" >&2
        exit 1
    fi
done
node -e '
    const { readFileSync } = require("node:fs");
    const index = JSON.parse(readFileSync(process.argv[1], "utf8"));
    if (!index.entries || !Object.keys(index.entries).length) throw new Error("Storybook has no entries");
' "$staging/index.json"

chmod 755 "$staging"
release_name="$(date -u +%Y%m%dT%H%M%SZ)-$$"
mv -- "$staging" "$releases/$release_name"
staging=''
ln -s -- "releases/$release_name" "$next"
mv -Tf -- "$next" "$storybook_root/current"

printf 'Published Storybook from %s\nRelease: %s\nURL: https://storybook.jkdv1.net/\n' "$project" "$release_name"
