#!/bin/bash

# Water Monitoring Infrastructure - SSL Certificate Generation Script
set -e

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../ssl" && pwd)"
CERT_VALIDITY=365
COUNTRY="US"
STATE="California"
CITY="San Francisco"
ORGANIZATION="Water Monitoring Infrastructure"
COMMON_NAME="water-monitor.local"

echo "Generating SSL certificates..."

# Create SSL directory
mkdir -p "$CERT_DIR"

# Generate private key
openssl genrsa -out "$CERT_DIR/key.pem" 2048

# Generate self-signed certificate
openssl req -x509 -new -nodes -key "$CERT_DIR/key.pem" -sha256 -days "$CERT_VALIDITY" \
    -out "$CERT_DIR/cert.pem" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/CN=$COMMON_NAME"

# Generate DH parameters
openssl dhparam -out "$CERT_DIR/dhparam.pem" 2048

# Set permissions
chmod 600 "$CERT_DIR/key.pem"
chmod 644 "$CERT_DIR/cert.pem"
chmod 644 "$CERT_DIR/dhparam.pem"

echo "SSL certificates generated successfully!"
echo "Files created:"
echo "  Private Key: $CERT_DIR/key.pem"
echo "  Certificate: $CERT_DIR/cert.pem"
echo "  DH Parameters: $CERT_DIR/dhparam.pem"
