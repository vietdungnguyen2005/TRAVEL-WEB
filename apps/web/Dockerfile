# Stage 1: Install deps & build
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

# Copy workspace manifests first (layer cache)
COPY package.json package-lock.json* turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/shared/package.json ./packages/shared/

# Install all workspace deps, then ensure web workspace has its local deps
RUN npm install --legacy-peer-deps \
	&& npm -w web install --legacy-peer-deps

# Copy full source
COPY . .

# Build Next.js web
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy workspace node_modules and root package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy built web app
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

# Copy packages (may be imported at runtime)
COPY --from=builder /app/packages ./packages

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app/apps/web
CMD ["../../node_modules/.bin/next", "start", "-H", "0.0.0.0"]
