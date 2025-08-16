#!/usr/bin/env python3
"""
Water Treatment Plant Data Collector
Collects system metrics and forwards them to InfluxDB
"""

import os
import time
import psutil
import argparse
import logging
from datetime import datetime
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataCollector:
    def __init__(self, plant_id):
        self.plant_id = plant_id
        
        # InfluxDB configuration
        self.influxdb_url = os.getenv('INFLUXDB_URL', 'http://localhost:8086')
        self.influxdb_token = os.getenv('INFLUXDB_TOKEN', 'water_monitoring_token_2024')
        self.influxdb_org = os.getenv('INFLUXDB_ORG', 'water_treatment')
        self.influxdb_bucket = os.getenv('INFLUXDB_BUCKET', 'water_metrics')
        
        # Collection interval
        self.collection_interval = int(os.getenv('COLLECTION_INTERVAL', 30))
        
        # Initialize InfluxDB client
        self.client = None
        self.write_api = None
        self.connect_influxdb()
        
    def connect_influxdb(self):
        """Connect to InfluxDB"""
        try:
            self.client = InfluxDBClient(
                url=self.influxdb_url,
                token=self.influxdb_token,
                org=self.influxdb_org
            )
            self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
            logger.info(f"Connected to InfluxDB at {self.influxdb_url}")
        except Exception as e:
            logger.error(f"Failed to connect to InfluxDB: {e}")
            self.client = None
            self.write_api = None
    
    def collect_system_metrics(self):
        """Collect system performance metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_io = psutil.disk_io_counters()
            
            # Network metrics
            network = psutil.net_io_counters()
            
            # Process metrics
            process_count = len(psutil.pids())
            
            metrics = {
                'cpu_percent': cpu_percent,
                'cpu_count': cpu_count,
                'cpu_freq_mhz': cpu_freq.current if cpu_freq else 0,
                'memory_percent': memory.percent,
                'memory_used_gb': memory.used / (1024**3),
                'memory_total_gb': memory.total / (1024**3),
                'disk_percent': disk.percent,
                'disk_used_gb': disk.used / (1024**3),
                'disk_total_gb': disk.total / (1024**3),
                'disk_read_mb': disk_io.read_bytes / (1024**2) if disk_io else 0,
                'disk_write_mb': disk_io.write_bytes / (1024**2) if disk_io else 0,
                'network_sent_mb': network.bytes_sent / (1024**2),
                'network_recv_mb': network.bytes_recv / (1024**2),
                'process_count': process_count
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to collect system metrics: {e}")
            return {}
    
    def collect_docker_metrics(self):
        """Collect Docker container metrics"""
        try:
            import docker
            
            client = docker.from_env()
            containers = client.containers.list()
            
            docker_metrics = {
                'container_count': len(containers),
                'running_containers': len([c for c in containers if c.status == 'running']),
                'total_cpu_usage': 0,
                'total_memory_usage': 0
            }
            
            for container in containers:
                try:
                    stats = container.stats(stream=False)
                    
                    # CPU usage calculation
                    cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - \
                               stats['precpu_stats']['cpu_usage']['total_usage']
                    system_delta = stats['cpu_stats']['system_cpu_usage'] - \
                                  stats['precpu_stats']['system_cpu_usage']
                    
                    if system_delta > 0:
                        cpu_percent = (cpu_delta / system_delta) * 100
                        docker_metrics['total_cpu_usage'] += cpu_percent
                    
                    # Memory usage
                    memory_usage = stats['memory_stats']['usage']
                    docker_metrics['total_memory_usage'] += memory_usage / (1024**2)  # Convert to MB
                    
                except Exception as e:
                    logger.warning(f"Failed to get stats for container {container.name}: {e}")
                    continue
            
            return docker_metrics
            
        except ImportError:
            logger.warning("Docker Python library not available, skipping Docker metrics")
            return {}
        except Exception as e:
            logger.error(f"Failed to collect Docker metrics: {e}")
            return {}
    
    def collect_network_connectivity(self):
        """Check network connectivity to main hub"""
        import subprocess
        import socket
        
        connectivity_metrics = {}
        
        # Check if we can reach the main hub
        try:
            # Extract hostname from InfluxDB URL
            hostname = self.influxdb_url.replace('http://', '').replace('https://', '').split(':')[0]
            
            # Ping test
            try:
                result = subprocess.run(['ping', '-c', '1', '-W', '5', hostname], 
                                      capture_output=True, text=True, timeout=10)
                connectivity_metrics['ping_success'] = result.returncode == 0
                if result.returncode == 0:
                    # Extract ping time
                    for line in result.stdout.split('\n'):
                        if 'time=' in line:
                            ping_time = line.split('time=')[1].split()[0]
                            connectivity_metrics['ping_time_ms'] = float(ping_time)
                            break
            except Exception:
                connectivity_metrics['ping_success'] = False
            
            # TCP connection test
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(5)
                port = 8086 if '8086' in self.influxdb_url else 80
                result = sock.connect_ex((hostname, port))
                connectivity_metrics['tcp_connect'] = result == 0
                sock.close()
            except Exception:
                connectivity_metrics['tcp_connect'] = False
            
            # HTTP connectivity test
            try:
                import requests
                response = requests.get(self.influxdb_url, timeout=5)
                connectivity_metrics['http_connect'] = response.status_code < 400
            except Exception:
                connectivity_metrics['http_connect'] = False
                
        except Exception as e:
            logger.error(f"Failed to check network connectivity: {e}")
            connectivity_metrics = {
                'ping_success': False,
                'tcp_connect': False,
                'http_connect': False
            }
        
        return connectivity_metrics
    
    def send_metrics_to_influxdb(self, system_metrics, docker_metrics, connectivity_metrics):
        """Send collected metrics to InfluxDB"""
        if not self.write_api:
            logger.error("InfluxDB not connected")
            return False
        
        try:
            points = []
            timestamp = datetime.utcnow()
            
            # System metrics
            for metric_name, value in system_metrics.items():
                point = Point("system_metrics") \
                    .tag("plant_id", self.plant_id) \
                    .tag("metric_type", metric_name) \
                    .field("value", value) \
                    .time(timestamp)
                points.append(point)
            
            # Docker metrics
            for metric_name, value in docker_metrics.items():
                point = Point("docker_metrics") \
                    .tag("plant_id", self.plant_id) \
                    .tag("metric_type", metric_name) \
                    .field("value", value) \
                    .time(timestamp)
                points.append(point)
            
            # Connectivity metrics
            for metric_name, value in connectivity_metrics.items():
                point = Point("connectivity_metrics") \
                    .tag("plant_id", self.plant_id) \
                    .tag("metric_type", metric_name) \
                    .field("value", 1 if value else 0) \
                    .time(timestamp)
                points.append(point)
            
            # Plant status
            status_point = Point("plant_status") \
                .tag("plant_id", self.plant_id) \
                .field("status", "operational") \
                .field("last_collection", timestamp.isoformat()) \
                .time(timestamp)
            points.append(status_point)
            
            self.write_api.write(bucket=self.influxdb_bucket, record=points)
            logger.info(f"Sent {len(points)} metric points to InfluxDB")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send metrics to InfluxDB: {e}")
            return False
    
    def run_collection(self):
        """Run the data collection process"""
        logger.info(f"Starting data collection for Plant {self.plant_id}")
        logger.info(f"Collection interval: {self.collection_interval} seconds")
        
        while True:
            try:
                # Collect metrics
                system_metrics = self.collect_system_metrics()
                docker_metrics = self.collect_docker_metrics()
                connectivity_metrics = self.collect_network_connectivity()
                
                # Log collected metrics
                logger.info(f"Collected {len(system_metrics)} system metrics, "
                          f"{len(docker_metrics)} Docker metrics, "
                          f"{len(connectivity_metrics)} connectivity metrics")
                
                # Send to InfluxDB
                if self.send_metrics_to_influxdb(system_metrics, docker_metrics, connectivity_metrics):
                    logger.info("Metrics sent successfully")
                else:
                    logger.warning("Failed to send metrics")
                
                # Wait for next collection
                time.sleep(self.collection_interval)
                
            except KeyboardInterrupt:
                logger.info("Data collection stopped by user")
                break
            except Exception as e:
                logger.error(f"Collection error: {e}")
                time.sleep(self.collection_interval)
        
        # Cleanup
        if self.client:
            self.client.close()

def main():
    parser = argparse.ArgumentParser(description='Water Treatment Plant Data Collector')
    parser.add_argument('--plant-id', required=True, help='Plant identifier (A, B, etc.)')
    parser.add_argument('--interval', type=int, default=30, help='Collection interval in seconds')
    
    args = parser.parse_args()
    
    # Create and run collector
    collector = DataCollector(args.plant_id)
    collector.run_collection()

if __name__ == "__main__":
    main()
