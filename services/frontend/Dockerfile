# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

ARG VITE_API_URL=http://localhost:5001
ARG VITE_AUTH_API_URL=http://localhost:5000
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_API_URL=${VITE_AUTH_API_URL}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
