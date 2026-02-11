# Nginx reverse proxy (SSL termination)

This folder contains the Nginx config used by `docker-compose.yml`.

## Certificates

Mount certificates into the container at:

- `infra/nginx/certs/fullchain.pem`
- `infra/nginx/certs/privkey.pem`

For production, use real certificates (e.g., via Let's Encrypt) and keep private keys out of git.
