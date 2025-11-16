# =============================================================================
# Auth Service - Production Dockerfile
# Multi-stage build with npm ci, non-root user, and layer optimization
# =============================================================================

# ---------- Stage 1: Dependencies ----------
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy only package lock files for better caching
COPY package.json package-lock.json ./

# Install dependencies with npm ci (deterministic, faster than npm install)
RUN npm ci --only=production && \
    # Cache production dependencies
    cp -R node_modules /prod_node_modules && \
    # Install all dependencies (including dev) for build
    npm ci

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source files
COPY package.json package-lock.json tsconfig.json ./
COPY controllers ./controllers
COPY middlewares ./middlewares
COPY models ./models
COPY routes ./routes
COPY utils ./utils
COPY server.ts ./
COPY env.d.ts ./
# Note: databases/ folder is optional - only needed if using GEO_PROVIDER=maxmind
# COPY databases ./databases

# Build TypeScript
RUN npm run build

# ---------- Stage 3: Runtime ----------
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /prod_node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
# Note: databases/ folder is optional - only needed if using GEO_PROVIDER=maxmind
# COPY --from=builder /app/databases ./databases

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]
