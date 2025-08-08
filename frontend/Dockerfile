# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Build the Vite app
RUN npm run build

RUN npm install http-server -g
CMD http-server ./dist -p 8080
