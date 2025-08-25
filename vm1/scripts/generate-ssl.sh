#!/bin/bash
# Water Monitoring Infrastructure - SSL Certificate Generation Script
set -euo pipefail

# Defaults (can be overridden by env or flags)
CERT_DIR=${CERT_DIR:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/../ssl" && pwd)"}
CERT_VALIDITY=${CERT_VALIDITY:-365}
COUNTRY=${COUNTRY:-"US"}
STATE=${STATE:-"California"}
CITY=${CITY:-"San Francisco"}
ORGANIZATION=${ORGANIZATION:-"Water Monitoring Infrastructure"}
COMMON_NAME=${COMMON_NAME:-"water-monitor.local"}
SAN=${SAN:-""} # comma-separated list, e.g. DNS:example.com,IP:127.0.0.1
FORCE=${FORCE:-"false"}
COPY_SHARED=${COPY_SHARED:-"false"}
SHARED_DIR=${SHARED_DIR:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/../../shared/certificates" && pwd)"}

print_usage() {
    echo "Usage: $(basename "$0") [options]"
    echo
    echo "Options:"
    echo "  -o, --out-dir DIR       Output directory for certs (default: $CERT_DIR)"
    echo "  -d, --days N            Certificate validity in days (default: $CERT_VALIDITY)"
    echo "      --cn NAME           Common Name (default: $COMMON_NAME)"
    echo "      --san LIST          Subject Alt Names, e.g. DNS:example.com,IP:127.0.0.1"
    echo "      --country CODE      Country (default: $COUNTRY)"
    echo "      --state NAME        State/Province (default: $STATE)"
    echo "      --city NAME         City/Locality (default: $CITY)"
    echo "      --org NAME          Organization (default: $ORGANIZATION)"
    echo "  -f, --force             Force regeneration even if files exist"
    echo "      --copy-shared       Copy cert and dhparam to shared/certificates"
    echo "      --shared-dir DIR    Override shared directory destination"
    echo "  -h, --help              Show this help message"
}

# Parse args
while [[ ${1:-} != "" ]]; do
    case "$1" in
        -o|--out-dir) CERT_DIR="$2"; shift 2;;
        -d|--days) CERT_VALIDITY="$2"; shift 2;;
        --cn) COMMON_NAME="$2"; shift 2;;
        --san) SAN="$2"; shift 2;;
        --country) COUNTRY="$2"; shift 2;;
        --state) STATE="$2"; shift 2;;
        --city) CITY="$2"; shift 2;;
        --org) ORGANIZATION="$2"; shift 2;;
        -f|--force) FORCE="true"; shift;;
        --copy-shared) COPY_SHARED="true"; shift;;
        --shared-dir) SHARED_DIR="$2"; shift 2;;
        -h|--help) print_usage; exit 0;;
        *) echo "Unknown option: $1"; print_usage; exit 1;;
    esac
done

# Dependency checks
if ! command -v openssl >/dev/null 2>&1; then
    echo "Error: openssl is required but not installed." >&2
    exit 1
fi

echo "Generating SSL certificates..."

# Create SSL directory
mkdir -p "$CERT_DIR"

key_file="$CERT_DIR/key.pem"
cert_file="$CERT_DIR/cert.pem"
dhparam_file="$CERT_DIR/dhparam.pem"

# Idempotency guard unless forced
if [[ -f "$key_file" && -f "$cert_file" && -f "$dhparam_file" && "$FORCE" != "true" ]]; then
    echo "Existing SSL artifacts detected in $CERT_DIR. Use --force to regenerate."
    echo "  Private Key: $key_file"
    echo "  Certificate: $cert_file"
    echo "  DH Params  : $dhparam_file"
    exit 0
fi

# Generate private key
openssl genrsa -out "$key_file" 2048

# Build OpenSSL config for SAN if provided
tmp_conf=""
extra_req_args=()
if [[ -n "$SAN" ]]; then
    tmp_conf=$(mktemp)
    {
        echo "[req]"
        echo "distinguished_name = dn"
        echo "x509_extensions = v3_req"
        echo "prompt = no"
        echo "[dn]"
        echo "C=$COUNTRY"
        echo "ST=$STATE"
        echo "L=$CITY"
        echo "O=$ORGANIZATION"
        echo "CN=$COMMON_NAME"
        echo "[v3_req]"
        echo "subjectAltName=$SAN"
    } > "$tmp_conf"
    extra_req_args=( -config "$tmp_conf" -extensions v3_req )
fi

# Generate self-signed certificate (with or without SAN)
if [[ -n "$SAN" ]]; then
    openssl req -x509 -new -nodes -key "$key_file" -sha256 -days "$CERT_VALIDITY" \
        -out "$cert_file" -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/CN=$COMMON_NAME" \
        "${extra_req_args[@]}"
else
    openssl req -x509 -new -nodes -key "$key_file" -sha256 -days "$CERT_VALIDITY" \
        -out "$cert_file" \
        -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/CN=$COMMON_NAME"
fi

# Clean up temp config
if [[ -n "$tmp_conf" && -f "$tmp_conf" ]]; then
    rm -f "$tmp_conf"
fi

# Generate DH parameters
openssl dhparam -out "$dhparam_file" 2048

# Set permissions
chmod 600 "$key_file"
chmod 644 "$cert_file"
chmod 644 "$dhparam_file"

# Optional copy to shared (exclude private key for safety)
if [[ "$COPY_SHARED" == "true" ]]; then
    mkdir -p "$SHARED_DIR"
    cp -f "$cert_file" "$SHARED_DIR/"
    cp -f "$dhparam_file" "$SHARED_DIR/"
    echo "Copied cert and dhparam to: $SHARED_DIR"
fi

echo "SSL certificates generated successfully!"
echo "Files created:"
echo "  Private Key: $key_file"
echo "  Certificate: $cert_file"
echo "  DH Parameters: $dhparam_file"
