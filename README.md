# Previews

Static pages served by nginx at https://jkdv1.net/.

## Publish pages

```sh
git clone git@github.com:nishimura-yuma77/preview.git
cd preview
# Add or edit files under previews/.
git add previews/
git commit -m "Update preview pages"
git push origin main
```

Every push to `main` triggers the **Deploy previews** GitHub Actions workflow.
It connects to the server over SSH, runs `/srv/scripts/deploy.sh`, and checks
the public HTTPS endpoint. The script fast-forwards `/srv` to the latest
`origin/main`. Static page updates are served immediately without restarting
nginx. A page at `previews/demo/index.html` is published at
`https://jkdv1.net/demo/`; add its link to `previews/index.html` as needed.

The workflow can also be run manually from the repository's Actions tab.
Deployment stops if `/srv` has uncommitted changes or cannot fast-forward.

## Deployment credentials

Repository Actions secrets:

- `DEPLOY_SSH_KEY`: the dedicated deployment private key.
- `DEPLOY_KNOWN_HOSTS`: the server's verified SSH host public key in
  `known_hosts` format, for `210.131.219.238`.

The matching public key in the server user's `authorized_keys` is restricted
to `/bin/sh /srv/scripts/deploy.sh`, with SSH forwarding and PTY disabled.
Keys and certificates must not be committed to this repository.

## HTTPS certificates

Certbot data is stored under `/srv/certbot/`, which is excluded from Git.
The server user's crontab runs `scripts/renew-certificates.sh` twice daily
(03:17 and 15:17, server time). See `scripts/certbot.cron` for the entry.
Renewal output is written to `/srv/certbot/logs/renewal.log`.

Changes to Docker or nginx configuration require the appropriate configuration
validation and reload/recreation in addition to syncing the repository.
