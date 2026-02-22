# ── Monorepo-aware build — context must be repo root ──────────────────────────

# Stage 1: Build
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

# 1. Root manifests (cache layer)
COPY package.json package-lock.json tsconfig.base.json ./

# 2. All workspace sources (node_modules/dist excluded via .dockerignore)
COPY packages ./packages
COPY services ./services
COPY apps ./apps

# 3. Install all workspace deps from root
RUN npm ci

# 4. Compile
RUN npm -w api-gateway run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/services/api-gateway/dist         ./services/api-gateway/dist
COPY --from=builder /app/services/api-gateway/package.json ./services/api-gateway/package.json
COPY --from=builder /app/node_modules                      ./node_modules

WORKDIR /app/services/api-gateway
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
