# Multi-Host Water Monitoring Infrastructure

A distributed water treatment facility monitoring system across 3 VMs with InfluxDB 2, React dashboard, automated backups, and SSL-secured nginx reverse proxy.

## 🏗️ Architecture

```
VM1 (Main Hub)          VM2 (Treatment Plant A)    VM3 (Treatment Plant B)
├── InfluxDB 2          ├── Sensor Simulators       ├── Sensor Simulators
├── React Dashboard     ├── Data Collection Agent   ├── Data Collection Agent
├── Nginx (SSL)         └── Local Monitoring        └── Local Monitoring
├── Backup System
└── Grafana (optional)
```

## 🚀 Features

- **Real-time Monitoring**: Live water quality metrics from distributed sensors
- **Multi-Plant Support**: Monitor multiple treatment facilities simultaneously
- **Modern Dashboard**: React-based responsive web interface
- **Data Storage**: InfluxDB 2 for time-series data management
- **SSL Security**: HTTPS encryption for all communications
- **Automated Backups**: Daily system backups with retention policies
- **Health Monitoring**: Automated system health checks and alerting
- **Scalable Design**: Easy to add more treatment plants

## 📋 Prerequisites

- **VM1 (Main Hub)**: Ubuntu 20.04+ with 4GB RAM, 50GB storage
- **VM2 & VM3 (Plants)**: Ubuntu 20.04+ with 2GB RAM, 20GB storage
- **Docker & Docker Compose**: Latest stable versions
- **Network**: VMs must be able to communicate with each other

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd water-monitoring-infrastructure
```

### 2. Install Docker (All VMs)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Setup VM1 (Main Hub)

```bash
cd vm1

# Generate SSL certificates (with SANs and copy to shared)
chmod +x scripts/generate-ssl.sh
./scripts/generate-ssl.sh --san "DNS:localhost,IP:127.0.0.1" --copy-shared

# Start the main infrastructure
cd docker
docker-compose up -d

# Verify services
docker-compose ps
```

### 4. Setup VM2 & VM3 (Treatment Plants)

```bash
# On VM2
cd vm2/docker
docker-compose up -d

# On VM3
cd vm3/docker
docker-compose up -d
```

### 5. Deploy React Dashboard

```bash
cd dashboard

# Install dependencies
npm install

# Build for production
npm run build

# Or run in development mode
npm start
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each VM directory:

**VM1 (Main Hub)**
```env
INFLUXDB_TOKEN=water_monitoring_token_2024
INFLUXDB_ORG=water_treatment
INFLUXDB_BUCKET=water_metrics
```

**VM2 & VM3 (Plants)**
```env
INFLUXDB_URL=http://vm1:8086
INFLUXDB_TOKEN=water_monitoring_token_2024
PLANT_ID=A  # or B for VM3
```

### Network Configuration

Ensure VMs can communicate:
- VM1: 172.20.0.0/16
- VM2: 172.21.0.0/16  
- VM3: 172.22.0.0/16

## 📊 Access Points

- **Main Dashboard**: https://your-domain.com
- **InfluxDB UI**: https://your-domain.com:8086
- **Grafana**: https://your-domain.com/grafana
- **Plant A Local**: http://vm2:8080
- **Plant B Local**: http://vm3:8080

## 🔍 Monitoring & Health Checks

### Automated Health Checks

```bash
# Run health check once
./shared/monitoring/health-check.sh

# Run as daemon
./shared/monitoring/health-check.sh daemon
```

### Manual Service Checks

```bash
# Check Docker containers
docker-compose ps

# Check InfluxDB
curl http://localhost:8086/health

# Check Nginx
curl http://localhost/health
```

## 💾 Backup & Recovery

### Automated Backups

Backups run automatically every hour and include:
- InfluxDB data
- Configuration files
- Docker volumes
- System state

### Manual Backup

```bash
cd vm1/scripts
./backup-system.sh
```

### Restore from Backup

```bash
# Stop services
docker-compose down

# Restore InfluxDB
docker exec -it water_monitoring_influxdb influx restore /backup/path

# Restore volumes
docker run --rm -v volume_name:/data -v /backup:/backup \
    alpine tar -xzf /backup/volumes_backup.tar.gz -C /data

# Start services
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **InfluxDB Connection Failed**
   - Check network connectivity between VMs
   - Verify InfluxDB container is running
   - Check firewall settings

2. **SSL Certificate Errors**
   - Regenerate certificates: `./scripts/generate-ssl.sh`
   - Check certificate permissions
   - Verify Nginx configuration

3. **Dashboard Not Loading**
   - Check React build process
   - Verify Nginx proxy configuration
   - Check browser console for errors

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs influxdb
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

## 🔒 Security

- **SSL/TLS**: All communications encrypted with HTTPS
- **Authentication**: InfluxDB token-based authentication
- **Network Isolation**: Docker networks for service separation
- **File Permissions**: Secure file permissions for certificates

## 📈 Scaling

### Adding New Treatment Plants

1. Copy VM2 or VM3 directory structure
2. Update plant ID and configuration
3. Add to monitoring dashboard
4. Update network configuration

### Performance Tuning

- **InfluxDB**: Adjust memory and disk settings
- **Nginx**: Configure worker processes and connections
- **Docker**: Optimize resource limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs for error details

## 🔄 Updates

To update the system:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

**Note**: This is a development/testing setup. For production deployment, consider:
- Using Let's Encrypt for SSL certificates
- Implementing proper monitoring and alerting
- Setting up log aggregation
- Configuring automated testing
- Implementing CI/CD pipelines
