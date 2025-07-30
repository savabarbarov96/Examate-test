# ---------- Stage 1: Build ----------
FROM node:lts-buster

WORKDIR /app

# Copy and install all dependencies (including dev)
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the full source code
COPY . .

# Compile TypeScript → JavaScript
RUN npm run build
RUN npm set progress=false && npm install
CMD ["node", "server.js"]

