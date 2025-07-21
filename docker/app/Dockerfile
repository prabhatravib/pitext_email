# ========================================
# Base Stage: Alpine Linux with Node
# ========================================
FROM node:22-alpine AS base

# ========================================
# Dependencies Stage: Install Dependencies
# ========================================
FROM base AS deps
RUN apk add --no-cache libc6-compat git
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .//
RUN mkdir -p apps packages
COPY apps/*/package.json ./apps/
COPY packages/ ./packages/

RUN pnpm install --prod --ignore-scripts

# ========================================
# Builder Stage: Build the Application
# ========================================
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat git
RUN npm install -g pnpm

# Copy workspace configuration and source code
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY . .

# Set environment variables for build
ENV CI=true
ENV NODE_ENV=production
ENV VITE_BUILD_MODE=production

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Build the application with better error handling
RUN cd apps/mail && \
    echo "🔍 Starting build process..." && \
    echo "🔍 Current directory: $(pwd)" && \
    echo "🔍 Files in directory: $(ls -la)" && \
    echo "🔍 Checking if build script exists: $(test -f package.json && echo 'yes' || echo 'no')" && \
    echo "🔍 Node version: $(node --version)" && \
    echo "🔍 NPM version: $(npm --version)" && \
    echo "🔍 PNPM version: $(pnpm --version)" && \
    pnpm run build && \
    echo "🔍 Build completed, checking output..." && \
    ls -la build/client/ || echo "❌ Build directory not found" && \
    echo "✅ Build process completed"

# ========================================
# Runner Stage: Production Environment
# ========================================
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN addgroup -S -g 1001 pnpm && \
    adduser -S -u 1001 nextjs -G pnpm

# Set environment variables for production
ENV NODE_ENV=production \
    PORT=10000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Copy entrypoint and run it
COPY scripts/docker/ /app/scripts
RUN chmod -R +x /app/scripts/*

# Copy the entire built application
COPY --from=builder --chown=nextjs:pnpm /app ./

# Switch to non-root user
USER nextjs

# Set server port and host
EXPOSE 10000

# Start the server
CMD ["/app/scripts/entrypoint.sh"]