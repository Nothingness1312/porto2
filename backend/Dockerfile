# Backend Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy source and prisma schema
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production image
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# OpenSSL is required by Prisma engine detection on Alpine (musl)
RUN apk add --no-cache openssl

# Install production dependencies (includes prisma CLI + tsx for migrate/seed)
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built output and schema/migrations/seed
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Regenerate prisma client (matches schema in this image, as root)
RUN npx prisma generate

# Create non-root user and give it ownership of /app
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && node dist/index.js"]