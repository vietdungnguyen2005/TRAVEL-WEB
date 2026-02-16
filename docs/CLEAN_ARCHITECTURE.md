# Clean Architecture (Travel Web monorepo)

This repo is a microservices monorepo. Some services already follow a Clean Architecture style (notably `auth-service`), while others are more “Express app + libs”. This document standardizes a pragmatic approach you can apply incrementally without breaking existing APIs.

## Goals

- Keep business rules independent from frameworks (Express), databases (Prisma), and brokers (RabbitMQ).
- Make side effects (DB, queue, HTTP) depend on the application layer via **ports**.
- Keep refactors incremental: preserve routes and behavior while improving boundaries.

## The 4 layers (pragmatic)

### 1) Domain
**What belongs here**
- Entities / value objects
- Domain invariants and pure functions
- Domain events (as in “facts that happened”), *not* RabbitMQ envelopes

**What must NOT be here**
- Express types
- Prisma client/types
- RabbitMQ channel/connection
- `process.env`

**Suggested paths**
- `src/domain/**`

### 2) Application
**What belongs here**
- Use cases (or “services”): orchestrate domain + ports
- Interfaces/ports for external dependencies
- DTOs that represent the use case boundary

**What must NOT be here**
- Prisma, RabbitMQ, axios/fetch, nodemailer, etc.

**Suggested paths**
- `src/application/**`
- `src/application/**/ports/*.ts`
- `src/application/**/usecases/*.ts`

### 3) Infrastructure
**What belongs here**
- Prisma repositories implementing application ports
- RabbitMQ publishers/consumers implementing ports
- External clients (email, HTTP calls)
- Outbox publisher implementation (polling + publish)

**Suggested paths**
- `src/infrastructure/**`

### 4) Interfaces (delivery)
**What belongs here**
- Express routes/controllers
- Request validation (Zod)
- Auth middleware wiring
- Mapping HTTP ↔ use case DTOs

**Suggested paths**
- `src/interfaces/http/**`

## How this maps to existing services

### `auth-service`
Already close to the intended structure:
- `src/domain/**`
- `src/application/**`
- `src/infrastructure/**`
- `src/interfaces/http/**`

Treat it as the reference.

### Services that currently look like “Express + lib”
Many services (booking/payment/notification/etc.) have:
- `src/index.ts` (Express composition)
- `src/lib/**` (mixed concerns)

You can migrate incrementally:
1. Create `src/application/**` use case(s) for new features.
2. Move Prisma/RabbitMQ code into `src/infrastructure/**`.
3. Keep routes in place, but make them call a controller that calls a use case.

## Event-driven specifics (RabbitMQ + Outbox + Idempotency)

### Separate *domain events* from *integration events*
- Domain event: internal, pure data, emitted by domain/application.
- Integration event: what you publish to RabbitMQ (versioned contract, envelope, metadata).

In this repo, the integration envelope lives in `@travel-web/contracts` (e.g. `EventMessage`). That is fine, but avoid pulling it into domain objects.

### Outbox placement
- **Application**: defines a port like `OutboxRepository` and a use case that writes outbox rows as part of business transactions.
- **Infrastructure**: implements the outbox repository using Prisma, and runs the publisher loop that reads pending rows and publishes to RabbitMQ.

### Consumers placement
- **Interfaces** (optional): if you treat “queue consumer” as a delivery mechanism like HTTP.
- **Infrastructure**: actual RabbitMQ wiring and `consume()`.
- **Application**: handler function that processes an integration event via ports.

A good compromise:
- `src/infrastructure/mq/**` connects/consumes
- `src/application/**/handlers/**` contains pure-ish event handlers that call use cases

### Idempotency
Idempotency is cross-cutting and often infrastructure-heavy.
- The *policy* (must be idempotent by messageId) is application-level.
- The persistence of processed message IDs is infrastructure (Prisma).

If you keep the shared helper, keep its usage in infrastructure glue or in a thin adapter layer — don’t leak Prisma into domain.

## Composition root (wiring)
Every service should have one place that wires everything together:
- create Express app
- create Prisma client
- create RabbitMQ connection
- instantiate repositories/adapters
- instantiate use cases
- mount controllers/routes

Suggested:
- `src/main.ts` or `src/index.ts` as the composition root.

## Checklist for new code
- Domain has no imports from Express/Prisma/RabbitMQ.
- Application defines ports and use cases; no direct side effects.
- Infrastructure implements ports using Prisma/RabbitMQ.
- Interfaces validate input and call use cases.

## Optional: suggested folder template for services

```
src/
  domain/
  application/
    <bounded-context>/
      ports/
      usecases/
      handlers/
  infrastructure/
    prisma/
    mq/
  interfaces/
    http/
      controllers/
      routes/
  main.ts
```

## Next step
If you tell me which service you want as the “golden example” (payment vs booking vs notification), I can refactor one vertical slice (HTTP + DB + queue) into this structure while keeping API behavior identical.
