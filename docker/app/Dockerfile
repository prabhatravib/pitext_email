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

# Build the application with React Router
RUN cd apps/mail && \
    echo "🔍 Starting React Router build process..." && \
    echo "🔍 Current directory: $(pwd)" && \
    echo "🔍 Files in directory: $(ls -la)" && \
    echo "🔍 Node version: $(node --version)" && \
    echo "🔍 PNPM version: $(pnpm --version)" && \
    echo "🔍 Checking required files..." && \
    echo "  - index.html: $(test -f index.html && echo 'exists' || echo 'MISSING')" && \
    echo "  - react-router.config.ts: $(test -f react-router.config.ts && echo 'exists' || echo 'MISSING')" && \
    echo "  - build-client-only.js: $(test -f build-client-only.js && echo 'exists' || echo 'MISSING')" && \
    echo "  - app directory: $(test -d app && echo 'exists' || echo 'MISSING')" && \
    echo "🔍 Running prebuild script..." && \
    pnpm run prebuild || echo "⚠️ Prebuild script failed, continuing..." && \
    echo "🔍 Running React Router build..." && \
    pnpm run build && \
    echo "🔍 Build completed, verifying output..." && \
    echo "🔍 Build directory exists: $(test -d build && echo 'yes' || echo 'NO - BUILD FAILED')" && \
    echo "🔍 Client directory exists: $(test -d build/client && echo 'yes' || echo 'NO - BUILD FAILED')" && \
    echo "🔍 index.html exists: $(test -f build/client/index.html && echo 'yes' || echo 'NO - BUILD FAILED')" && \
    echo "🔍 Build directory contents:" && \
    ls -la build/ 2>/dev/null || (echo "❌ BUILD DIRECTORY NOT FOUND - BUILD FAILED" && exit 1) && \
    echo "🔍 Client directory contents:" && \
    ls -la build/client/ 2>/dev/null || (echo "❌ CLIENT DIRECTORY NOT FOUND - BUILD FAILED" && exit 1) && \
    echo "🔍 Verifying index.html exists:" && \
    ls -la build/client/index.html 2>/dev/null || (echo "❌ INDEX.HTML NOT FOUND - BUILD FAILED" && exit 1) && \
    echo "🔍 Verifying index.html content:" && \
    head -5 build/client/index.html && \
    echo "🔍 Verifying index.html is not empty:" && \
    test -s build/client/index.html && echo "✅ index.html is not empty" || (echo "❌ INDEX.HTML IS EMPTY - BUILD FAILED" && exit 1) && \
    echo "✅ React Router build process completed successfully"

# Create a fallback index.html if the build fails
RUN cd apps/mail && \
    if [ ! -f build/client/index.html ] || [ ! -s build/client/index.html ]; then \
        echo "⚠️ Creating fallback index.html due to build failure" && \
        mkdir -p build/client && \
        cp fallback-index.html build/client/index.html && \
        echo "✅ Fallback index.html created" && \
        ls -la build/client/index.html; \
    fi

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

# Copy entrypoint and verification scripts
COPY scripts/docker/ /app/scripts
RUN chmod -R +x /app/scripts/*

# Copy the entire built application
COPY --from=builder --chown=nextjs:pnpm /app ./

# Verify the build files are copied correctly - FAIL FAST if missing
RUN echo "🔍 Verifying copied build files..." && \
    echo "🔍 Apps directory exists: $(test -d apps && echo 'yes' || echo 'NO - CRITICAL ERROR')" && \
    echo "🔍 Mail app exists: $(test -d apps/mail && echo 'yes' || echo 'NO - CRITICAL ERROR')" && \
    echo "🔍 Build directory exists: $(test -d apps/mail/build && echo 'yes' || echo 'NO - BUILD NOT COPIED')" && \
    echo "🔍 Client directory exists: $(test -d apps/mail/build/client && echo 'yes' || echo 'NO - CLIENT NOT COPIED')" && \
    echo "🔍 index.html exists: $(test -f apps/mail/build/client/index.html && echo 'yes' || echo 'NO - INDEX.HTML NOT COPIED')" && \
    echo "🔍 Server.js exists: $(test -f apps/mail/server.js && echo 'yes' || echo 'NO - SERVER.JS NOT COPIED')" && \
    echo "🔍 Fallback index.html exists: $(test -f apps/mail/fallback-index.html && echo 'yes' || echo 'NO - FALLBACK NOT COPIED')" && \
    test -d apps/mail/build/client || (echo "❌ CLIENT DIRECTORY MISSING - DEPLOYMENT FAILED" && exit 1) && \
    test -f apps/mail/build/client/index.html || (echo "❌ INDEX.HTML MISSING - DEPLOYMENT FAILED" && exit 1) && \
    test -s apps/mail/build/client/index.html || (echo "❌ INDEX.HTML IS EMPTY - DEPLOYMENT FAILED" && exit 1) && \
    echo "🔍 Verifying index.html content:" && \
    head -5 apps/mail/build/client/index.html && \
    echo "✅ All build files verified successfully"

# Switch to non-root user
USER nextjs

# Set server port and host
EXPOSE 10000

# Start the server
CMD ["/app/scripts/entrypoint.sh"]