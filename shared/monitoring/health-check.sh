#!/bin/bash

# Water Monitoring Infrastructure - Health Check Script
set -e

# Configuration
LOG_FILE="/var/log/water_monitor_health.log"
ALERT_EMAIL="admin@water-monitor.local"
CHECK_INTERVAL=60

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check Docker containers
check_docker_containers() {
    log_message "Checking Docker containers..."
    
    local containers=("water_monitoring_influxdb" "water_monitoring_nginx" "water_monitoring_grafana")
    local all_healthy=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
            log_message "✓ Container $container is running"
        else
            log_message "✗ Container $container is not running or unhealthy"
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
    log_message "Checking InfluxDB connectivity..."
    
    if curl -s -f "http://localhost:8086/health" > /dev/null; then
        log_message "✓ InfluxDB is responding"
        return 0
    else
        log_message "✗ InfluxDB is not responding"
        return 1
    fi
}

# Function to check Nginx
check_nginx() {
    log_message "Checking Nginx..."
    
    if curl -s -f "http://localhost/health" > /dev/null; then
        log_message "✓ Nginx is responding"
        return 0
    else
        log_message "✗ Nginx is not responding"
        return 1
    fi
}

# Function to check system resources
check_system_resources() {
    log_message "Checking system resources..."
    
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory_usage=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    
    log_message "CPU Usage: ${cpu_usage}%"
    log_message "Memory Usage: ${memory_usage}%"
    log_message "Disk Usage: ${disk_usage}%"
    
    # Check thresholds
    local warnings=0
    
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log_message "⚠ Warning: High CPU usage"
        warnings=$((warnings + 1))
    fi
    
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        log_message "⚠ Warning: High memory usage"
        warnings=$((warnings + 1))
    fi
    
    if [ "$disk_usage" -gt 80 ]; then
        log_message "⚠ Warning: High disk usage"
        warnings=$((warnings + 1))
    fi
    
    if [ $warnings -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Function to check network connectivity
check_network() {
    log_message "Checking network connectivity..."
    
    local hosts=("8.8.8.8" "1.1.1.1")
    local all_reachable=true
    
    for host in "${hosts[@]}"; do
        if ping -c 1 -W 5 "$host" > /dev/null 2>&1; then
            log_message "✓ Host $host is reachable"
        else
            log_message "✗ Host $host is not reachable"
            all_reachable=false
        fi
    done
    
    if [ "$all_reachable" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to send alert
send_alert() {
    local message="$1"
    log_message "Sending alert: $message"
    
    # In a production environment, you would implement actual alerting here
    # For now, we'll just log it
    echo "ALERT: $message" >> "$LOG_FILE"
}

# Main health check function
run_health_check() {
    log_message "Starting health check..."
    
    local overall_status=0
    
    # Run all checks
    check_docker_containers || overall_status=1
    check_influxdb || overall_status=1
    check_nginx || overall_status=1
    check_system_resources || overall_status=1
    check_network || overall_status=1
    
    # Summary
    if [ $overall_status -eq 0 ]; then
        log_message "✓ All health checks passed"
    else
        log_message "✗ Some health checks failed"
        send_alert "Health check failed - system may have issues"
    fi
    
    return $overall_status
}

# Main execution
if [ "$1" = "daemon" ]; then
    log_message "Starting health check daemon (interval: ${CHECK_INTERVAL}s)"
    
    while true; do
        run_health_check
        sleep $CHECK_INTERVAL
    done
else
    # Run once
    run_health_check
fi
