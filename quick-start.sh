#!/bin/bash

# Water Monitoring Infrastructure - Quick Start Script
set -e

echo "🚀 Water Monitoring Infrastructure - Quick Start"
echo "================================================"
echo

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root"
    exit 1
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and back in, then run this script again."
    exit 0
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Prerequisites check passed"
echo

# Make scripts executable
echo "🔧 Setting up scripts..."
chmod +x vm1/scripts/*.sh
chmod +x shared/monitoring/*.sh

# Generate SSL certificates
echo "🔐 Generating SSL certificates..."
cd vm1/scripts
./generate-ssl.sh --san "DNS:localhost,IP:127.0.0.1" --copy-shared
cd ../..

# Start main hub
echo "🏗️ Starting main hub (VM1)..."
cd vm1/docker
docker-compose up -d
cd ../..

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
cd vm1/docker
docker-compose ps
cd ../..

echo
echo "🎉 Setup completed!"
echo
echo "Access points:"
echo "  - Dashboard: https://localhost"
echo "  - InfluxDB: https://localhost:8086"
echo "  - Grafana: https://localhost/grafana"
echo
echo "Next steps:"
echo "  1. Deploy treatment plants (VM2, VM3) on other machines"
echo "  2. Build and deploy React dashboard"
echo "  3. Configure monitoring and alerts"
echo
echo "For detailed instructions, see README.md"
