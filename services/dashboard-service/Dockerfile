# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and install all dependencies (including dev)
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the full source code
COPY . .

# Compile TypeScript → JavaScript
RUN npm run build

# ---------- Stage 2: Run ----------
FROM node:20-alpine

WORKDIR /app

# Copy only compiled output and production deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose app port
EXPOSE 5002

# Start the app
CMD ["node", "dist/server.js"]
