#!/bin/bash

echo "======================================"
echo "   Checking Required Ports"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ports=(5000 5001 6379 8080 27017)
port_names=("Auth Service" "User Service" "Redis" "Frontend" "MongoDB")
all_free=true

for i in "${!ports[@]}"; do
    port="${ports[$i]}"
    name="${port_names[$i]}"

    if lsof -i :$port > /dev/null 2>&1 || netstat -tuln 2>/dev/null | grep ":$port " > /dev/null; then
        echo -e "${RED}❌ Port $port ($name) is already in use${NC}"
        all_free=false
    else
        echo -e "${GREEN}✅ Port $port ($name) is available${NC}"
    fi
done

echo ""
if [ "$all_free" = true ]; then
    echo -e "${GREEN}All required ports are available!${NC}"
    exit 0
else
    echo -e "${RED}Some ports are in use. Please stop the conflicting services.${NC}"
    exit 1
fi
