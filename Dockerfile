# Multi-stage build producing a ~200MB runtime image.
# Works on Alibaba Cloud ACK/ECS, Tencent Cloud TKE, Fly.io, Railway, Render —
# anywhere that runs a container. Vercel does not need this file.

FROM node:22-alpine AS deps
WORKDIR /app
# openssl is what Prisma's query engine links against on Alpine.
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL only has to parse at build time; no queries run during `next build`.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
# `output: "standalone"` in next.config.ts puts a self-contained server here.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Needed so `prisma migrate deploy` can run against the live database.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
