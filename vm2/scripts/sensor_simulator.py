#!/usr/bin/env python3
"""
Water Treatment Plant Sensor Simulator
Simulates various water quality sensors and sends data to InfluxDB
"""

import os
import time
import random
import argparse
import logging
from datetime import datetime, timedelta
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class WaterSensorSimulator:
    def __init__(self, plant_id, plant_name, location):
        self.plant_id = plant_id
        self.plant_name = plant_name
        self.location = location
        
        # InfluxDB configuration
        self.influxdb_url = os.getenv('INFLUXDB_URL', 'http://localhost:8086')
        self.influxdb_token = os.getenv('INFLUXDB_TOKEN', 'water_monitoring_token_2024')
        self.influxdb_org = os.getenv('INFLUXDB_ORG', 'water_treatment')
        self.influxdb_bucket = os.getenv('INFLUXDB_BUCKET', 'water_metrics')
        
        # Sensor baseline values
        self.baseline_values = {
            'flow_rate': 800,  # L/min
            'ph_level': 7.1,
            'temperature': 22.0,  # °C
            'pressure': 2.8,  # bar
            'turbidity': 0.6,  # NTU
            'chlorine': 1.1,  # mg/L
            'dissolved_oxygen': 8.5,  # mg/L
            'conductivity': 450,  # µS/cm
            'total_dissolved_solids': 320,  # mg/L
            'alkalinity': 120  # mg/L as CaCO3
        }
        
        # Sensor variation ranges
        self.variation_ranges = {
            'flow_rate': (0.95, 1.05),  # ±5%
            'ph_level': (0.95, 1.05),   # ±5%
            'temperature': (0.98, 1.02), # ±2%
            'pressure': (0.97, 1.03),   # ±3%
            'turbidity': (0.8, 1.2),    # ±20%
            'chlorine': (0.9, 1.1),     # ±10%
            'dissolved_oxygen': (0.95, 1.05),
            'conductivity': (0.95, 1.05),
            'total_dissolved_solids': (0.95, 1.05),
            'alkalinity': (0.95, 1.05)
        }
        
        # Initialize InfluxDB client
        self.client = None
        self.write_api = None
        self.connect_influxdb()
        
        # Simulation state
        self.simulation_time = datetime.now()
        self.day_cycle = 0  # Days since simulation start
        
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
    
    def generate_sensor_reading(self, sensor_name, base_value, variation_range):
        """Generate a realistic sensor reading with natural variation"""
        # Add time-based variation (daily cycles, seasonal trends)
        time_factor = self.get_time_factor(sensor_name)
        
        # Add random variation
        random_factor = random.uniform(*variation_range)
        
        # Add some noise
        noise = random.uniform(-0.02, 0.02)
        
        # Calculate final value
        final_value = base_value * time_factor * random_factor * (1 + noise)
        
        # Apply sensor-specific constraints
        final_value = self.apply_sensor_constraints(sensor_name, final_value)
        
        return round(final_value, 3)
    
    def get_time_factor(self, sensor_name):
        """Get time-based variation factor for different sensors"""
        current_hour = self.simulation_time.hour
        current_day = self.day_cycle
        
        if sensor_name == 'flow_rate':
            # Peak usage during morning (7-9) and evening (18-20)
            if 7 <= current_hour <= 9:
                return 1.15
            elif 18 <= current_hour <= 20:
                return 1.10
            elif 23 <= current_hour or current_hour <= 5:
                return 0.85
            else:
                return 1.0
                
        elif sensor_name == 'temperature':
            # Daily temperature cycle
            if 14 <= current_hour <= 16:
                return 1.05  # Warmest in afternoon
            elif 4 <= current_hour <= 6:
                return 0.95  # Coolest in early morning
            else:
                return 1.0
                
        elif sensor_name == 'ph_level':
            # Slight variation during peak usage
            if 7 <= current_hour <= 9 or 18 <= current_hour <= 20:
                return 1.02
            else:
                return 1.0
                
        else:
            return 1.0
    
    def apply_sensor_constraints(self, sensor_name, value):
        """Apply realistic constraints to sensor values"""
        constraints = {
            'ph_level': (6.5, 8.5),
            'temperature': (15.0, 30.0),
            'pressure': (1.5, 4.0),
            'turbidity': (0.1, 2.0),
            'chlorine': (0.5, 2.0),
            'dissolved_oxygen': (6.0, 12.0),
            'conductivity': (200, 800),
            'total_dissolved_solids': (150, 500),
            'alkalinity': (80, 200)
        }
        
        if sensor_name in constraints:
            min_val, max_val = constraints[sensor_name]
            return max(min_val, min(max_val, value))
        
        return value
    
    def simulate_anomaly(self, sensor_name, value):
        """Simulate occasional sensor anomalies"""
        anomaly_chance = 0.001  # 0.1% chance per reading
        
        if random.random() < anomaly_chance:
            anomaly_types = {
                'flow_rate': (0.5, 2.0),      # Drastic flow changes
                'ph_level': (0.3, 3.0),       # pH spikes
                'temperature': (0.7, 1.5),    # Temperature anomalies
                'pressure': (0.5, 2.0),       # Pressure spikes
                'turbidity': (2.0, 5.0),      # High turbidity events
                'chlorine': (0.1, 3.0)        # Chlorine variations
            }
            
            if sensor_name in anomaly_types:
                min_factor, max_factor = anomaly_types[sensor_name]
                anomaly_factor = random.uniform(min_factor, max_factor)
                logger.warning(f"Simulating anomaly for {sensor_name}: {value} -> {value * anomaly_factor}")
                return value * anomaly_factor
        
        return value
    
    def generate_readings(self):
        """Generate readings for all sensors"""
        readings = {}
        
        for sensor_name, base_value in self.baseline_values.items():
            variation_range = self.variation_ranges.get(sensor_name, (0.95, 1.05))
            reading = self.generate_sensor_reading(sensor_name, base_value, variation_range)
            reading = self.simulate_anomaly(sensor_name, reading)
            readings[sensor_name] = reading
        
        return readings
    
    def send_to_influxdb(self, readings):
        """Send sensor readings to InfluxDB"""
        if not self.write_api:
            logger.error("InfluxDB not connected")
            return False
        
        try:
            points = []
            timestamp = datetime.utcnow()
            
            for sensor_name, value in readings.items():
                point = Point("water_metrics") \
                    .tag("plant_id", self.plant_id) \
                    .tag("plant_name", self.plant_name) \
                    .tag("location", self.location) \
                    .tag("sensor_type", sensor_name) \
                    .field("value", value) \
                    .time(timestamp)
                points.append(point)
            
            # Add plant status point
            status_point = Point("plant_status") \
                .tag("plant_id", self.plant_id) \
                .tag("plant_name", self.plant_name) \
                .tag("location", self.location) \
                .field("status", "operational") \
                .field("uptime_hours", random.uniform(95, 100)) \
                .time(timestamp)
            points.append(status_point)
            
            self.write_api.write(bucket=self.influxdb_bucket, record=points)
            logger.info(f"Sent {len(points)} data points to InfluxDB")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send data to InfluxDB: {e}")
            return False
    
    def run_simulation(self, interval=30):
        """Run the sensor simulation"""
        logger.info(f"Starting sensor simulation for {self.plant_name} ({self.location})")
        logger.info(f"Data collection interval: {interval} seconds")
        
        while True:
            try:
                # Update simulation time
                self.simulation_time = datetime.now()
                
                # Generate sensor readings
                readings = self.generate_readings()
                
                # Log readings
                logger.info(f"Generated readings: {readings}")
                
                # Send to InfluxDB
                if self.send_to_influxdb(readings):
                    logger.info("Data sent successfully")
                else:
                    logger.warning("Failed to send data")
                
                # Wait for next interval
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Simulation stopped by user")
                break
            except Exception as e:
                logger.error(f"Simulation error: {e}")
                time.sleep(interval)
        
        # Cleanup
        if self.client:
            self.client.close()

def main():
    parser = argparse.ArgumentParser(description='Water Treatment Plant Sensor Simulator')
    parser.add_argument('--plant-id', required=True, help='Plant identifier (A, B, etc.)')
    parser.add_argument('--plant-name', required=True, help='Plant name')
    parser.add_argument('--location', required=True, help='Plant location')
    parser.add_argument('--interval', type=int, default=30, help='Data collection interval in seconds')
    
    args = parser.parse_args()
    
    # Create and run simulator
    simulator = WaterSensorSimulator(args.plant_id, args.plant_name, args.location)
    simulator.run_simulation(args.interval)

if __name__ == "__main__":
    main()
