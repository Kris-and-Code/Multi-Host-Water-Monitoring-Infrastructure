#!/bin/bash

# Plant A Health Check Script
set -e

PLANT_ID="A"
PLANT_NAME="Plant A"
INFLUXDB_URL="${INFLUXDB_URL:-http://vm1:8086}"
INFLUXDB_TOKEN="${INFLUXDB_TOKEN:-water_monitoring_token_2024}"
INFLUXDB_ORG="${INFLUXDB_ORG:-water_treatment}"
INFLUXDB_BUCKET="${INFLUXDB_BUCKET:-water_metrics}"

echo "$(date): Starting health check for $PLANT_NAME"

# Check if InfluxDB is reachable
if curl -s --connect-timeout 5 "$INFLUXDB_URL/health" > /dev/null; then
    echo "✅ InfluxDB connection: OK"
    
    # Send health status to InfluxDB
    timestamp=$(date +%s)000000000
    curl -s -X POST "$INFLUXDB_URL/api/v2/write?org=$INFLUXDB_ORG&bucket=$INFLUXDB_BUCKET" \
        -H "Authorization: Token $INFLUXDB_TOKEN" \
        -H "Content-Type: text/plain; charset=utf-8" \
        -d "plant_health,plant_id=$PLANT_ID,plant_name=$PLANT_NAME status=\"healthy\",timestamp=$timestamp"
    
    echo "✅ Health status sent to InfluxDB"
else
    echo "❌ InfluxDB connection: FAILED"
    
    # Send error status to InfluxDB if possible
    timestamp=$(date +%s)000000000
    curl -s -X POST "$INFLUXDB_URL/api/v2/write?org=$INFLUXDB_ORG&bucket=$INFLUXDB_BUCKET" \
        -H "Authorization: Token $INFLUXDB_TOKEN" \
        -H "Content-Type: text/plain; charset=utf-8" \
        -d "plant_health,plant_id=$PLANT_ID,plant_name=$PLANT_NAME status=\"error\",error=\"influxdb_unreachable\",timestamp=$timestamp" || true
fi

# Check local services
if curl -s --connect-timeout 5 "http://localhost:8080/health" > /dev/null; then
    echo "✅ Local monitoring: OK"
else
    echo "❌ Local monitoring: FAILED"
fi

# Check system resources
memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

echo "📊 System Status:"
echo "   Memory Usage: ${memory_usage}%"
echo "   Disk Usage: ${disk_usage}%"

# Send system metrics to InfluxDB
if curl -s --connect-timeout 5 "$INFLUXDB_URL/health" > /dev/null; then
    timestamp=$(date +%s)000000000
    curl -s -X POST "$INFLUXDB_URL/api/v2/write?org=$INFLUXDB_ORG&bucket=$INFLUXDB_BUCKET" \
        -H "Authorization: Token $INFLUXDB_TOKEN" \
        -H "Content-Type: text/plain; charset=utf-8" \
        -d "system_metrics,plant_id=$PLANT_ID,plant_name=$PLANT_NAME memory_usage=$memory_usage,disk_usage=$disk_usage,timestamp=$timestamp"
fi

echo "$(date): Health check completed for $PLANT_NAME"
