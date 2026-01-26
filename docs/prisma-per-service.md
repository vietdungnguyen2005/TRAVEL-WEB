# Prisma per-service guidance

This repository follows **DB-per-service**. Each service that needs SQL DB access owns its own `prisma/schema.prisma` and runs Prisma commands from the service folder.

Examples:

- Booking service

```bash
cd services/booking-service
npm install
# generate client
npm run prisma:generate
# run migrations (local dev)
npm run prisma:migrate
```

- Environment variables

Each service has its own env var name in its `schema.prisma` datasource (examples from the current compose):

- `AUTH_DATABASE_URL`
- `BOOKING_DATABASE_URL`
- `ROOM_DATABASE_URL`
- `PAYMENT_DATABASE_URL`
- `REVIEW_DATABASE_URL`

Ensure you set them before running migrations.

## Notes on non-Prisma services

- **Review DB (planned MongoDB):** the target design uses MongoDB for the review service. Prisma can support MongoDB, but the current repo uses Postgres (`review-db`) in `docker-compose.yml`. If/when switching to MongoDB, that service will own its Mongo connection + migrations strategy.

Notes:
- For students, you can reuse a single Postgres instance and set different DB names or schemas per service.
- For production, prefer separate DB instances or managed DB per bounded context.
