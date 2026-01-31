# Stage 1: Build (monorepo-aware)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better caching
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./

COPY packages ./packages
COPY services/blog-service ./services/blog-service

RUN npm ci

# Prisma client for blog-service (uses BLOG_DATABASE_URL at runtime)
RUN npm -w blog-service run prisma:generate
RUN npm -w blog-service run build

# Stage 2: Production runtime
FROM node:18-alpine

WORKDIR /app

# Only copy what we need to run blog-service
COPY --from=builder /app/services/blog-service/dist ./dist
COPY --from=builder /app/services/blog-service/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/blog-service/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/services/blog-service/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3008
CMD ["node", "dist/index.js"]
