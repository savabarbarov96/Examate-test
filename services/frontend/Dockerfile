# =============================================================================
# Frontend - Production Dockerfile
# Multi-stage build with Vite and Nginx
# =============================================================================

# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

# Build-time environment variables for Vite
ARG VITE_API_URL=http://localhost:5001
ARG VITE_AUTH_API_URL=http://localhost:5000
ARG VITE_DASHBOARD_API_URL=http://localhost:5002
ARG VITE_STATISTICS_API_URL=http://localhost:5003

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_API_URL=${VITE_AUTH_API_URL}
ENV VITE_DASHBOARD_API_URL=${VITE_DASHBOARD_API_URL}
ENV VITE_STATISTICS_API_URL=${VITE_STATISTICS_API_URL}

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with npm ci
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx || true

# Nginx will run as root but workers will run as nginx user
# This is standard practice for Nginx

# Expose port 80 (standard HTTP)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
