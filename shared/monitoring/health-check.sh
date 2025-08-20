#!/bin/bash
# Water Monitoring Infrastructure - Health Check Script
set -e

LOG_FILE="/tmp/water_monitor_health.log"
CHECK_INTERVAL=60

echo "Starting health check..."

# Function to check Docker containers
check_docker_containers() {
    echo "Checking Docker containers..."
    
    local containers=("water_monitoring_influxdb" "water_monitoring_nginx")
    local all_healthy=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
            echo "✓ Container $container is running"
        else
            echo "✗ Container $container is not running or unhealthy"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to check InfluxDB connectivity
check_influxdb() {
    echo "Checking InfluxDB connectivity..."
    
    if curl -s -f "http://localhost:8086/health" > /dev/null; then
        echo "✓ InfluxDB is responding"
        return 0
    else
        echo "✗ InfluxDB is not responding"
        return 1
    fi
}

# Function to check Nginx
check_nginx() {
    echo "Checking Nginx..."
    
    if curl -s -f "http://localhost/health" > /dev/null; then
        echo "✓ Nginx is responding"
        return 0
    else
        echo "✗ Nginx is not responding"
        return 1
    fi
}

# Main health check function
run_health_check() {
    echo "Starting health check..."
    
    local overall_status=0
    
    # Run all checks
    check_docker_containers || overall_status=1
    check_influxdb || overall_status=1
    check_nginx || overall_status=1
    
    # Summary
    if [ $overall_status -eq 0 ]; then
        echo "✓ All health checks passed"
    else
        echo "✗ Some health checks failed"
    fi
    
    return $overall_status
}

# Run health check
run_health_check
