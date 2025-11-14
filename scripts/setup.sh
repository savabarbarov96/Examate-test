#!/bin/bash

echo "======================================"
echo "   Examate Setup Script"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Create root .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating root .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your JWT secrets and email credentials${NC}"
else
    echo -e "${GREEN}✅ Root .env file already exists${NC}"
fi

# Create service .env files
echo ""
echo -e "${YELLOW}📝 Setting up service .env files...${NC}"

services=("auth-service" "user-service" "frontend")
for service in "${services[@]}"; do
    service_path="services/$service"
    if [ -f "$service_path/.env.example" ] && [ ! -f "$service_path/.env" ]; then
        cp "$service_path/.env.example" "$service_path/.env"
        echo -e "${GREEN}✅ Created .env for $service${NC}"
    elif [ -f "$service_path/.env" ]; then
        echo -e "${GREEN}✅ .env already exists for $service${NC}"
    else
        echo -e "${YELLOW}⚠️  No .env.example found for $service${NC}"
    fi
done

echo ""
echo -e "${GREEN}======================================"
echo "   Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit the root .env file with your secrets:"
echo "   nano .env"
echo ""
echo "2. Start all services (production mode):"
echo "   docker-compose up -d"
echo ""
echo "   Or for development mode with hot reload:"
echo "   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up"
echo ""
echo "3. Check logs:"
echo "   docker-compose logs -f"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:8080"
echo "   Auth API: http://localhost:5000"
echo "   User API: http://localhost:5001"
echo ""
