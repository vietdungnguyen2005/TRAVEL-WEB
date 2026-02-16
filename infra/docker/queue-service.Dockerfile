# Generic workspace builder for queue demo services
# Usage: docker build -f infra/docker/queue-service.Dockerfile --build-arg SERVICE_PATH=services/booking-service .

ARG SERVICE_PATH=services/booking-service

FROM node:20-alpine AS deps
WORKDIR /repo

COPY package.json package-lock.json ./

# Copy workspace manifests to let npm resolve workspaces efficiently
COPY packages/shared/package.json packages/shared/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY ${SERVICE_PATH}/package.json ${SERVICE_PATH}/package.json

RUN npm ci

FROM deps AS build
ARG SERVICE_PATH
WORKDIR /repo

COPY tsconfig.base.json tsconfig.json turbo.json ./
COPY packages/shared packages/shared
COPY packages/contracts packages/contracts
COPY ${SERVICE_PATH} ${SERVICE_PATH}

# Build shared first (runtime dependency)
RUN npm -w packages/shared run build

# Build contracts (used for shared event message typing/contracts at runtime)
RUN npm -w packages/contracts run build

# Generate Prisma client + build the service
RUN npm -w ${SERVICE_PATH} run prisma:generate
RUN npm -w ${SERVICE_PATH} run build

FROM node:20-alpine AS runner
ARG SERVICE_PATH
WORKDIR /repo
ENV NODE_ENV=production

# Keep root manifests so we can run workspace scripts in containers (migrate, etc.)
COPY --from=build /repo/package.json /repo/package.json
COPY --from=build /repo/package-lock.json /repo/package-lock.json
COPY --from=build /repo/node_modules /repo/node_modules

# Copy built artifacts
COPY --from=build /repo/packages/shared /repo/packages/shared
COPY --from=build /repo/packages/contracts /repo/packages/contracts
COPY --from=build /repo/${SERVICE_PATH} /repo/${SERVICE_PATH}

WORKDIR /repo/${SERVICE_PATH}

CMD ["node", "dist/main.js"]
