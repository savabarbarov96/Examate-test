# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Build the Vite app
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine AS runner

# Copy the built files from the builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port nginx runs on
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
