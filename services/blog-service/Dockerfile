# Stage 1: Build (monorepo-aware)
FROM node:20-alpine AS builder

WORKDIR /app
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY
ENV NO_PROXY=$NO_PROXY

RUN if [ -n "$HTTP_PROXY" ]; then npm config set proxy "$HTTP_PROXY"; fi \
	&& if [ -n "$HTTPS_PROXY" ]; then npm config set https-proxy "$HTTPS_PROXY"; fi \
	&& if [ -n "$NO_PROXY" ]; then npm config set noproxy "$NO_PROXY"; fi

# Copy workspace manifests first for better caching
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./

COPY packages ./packages
COPY services ./services
COPY apps ./apps

RUN npm ci

# Prisma client for blog-service (uses BLOG_DATABASE_URL at runtime)
RUN npm -w blog-service run prisma:generate
RUN npm -w blog-service run build

# Stage 2: Production runtime
FROM node:20-alpine

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
