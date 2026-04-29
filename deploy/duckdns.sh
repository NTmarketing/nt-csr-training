#!/bin/bash
# DuckDNS IP updater — runs via cron every 5 minutes.
# Trevor must register the subdomain at duckdns.org first and provide:
#   - DUCKDNS_DOMAIN  (e.g. "nt-csr-training")
#   - DUCKDNS_TOKEN   (from duckdns.org account)
# Set these in /opt/nt-csr-training/.duckdns.env

set -e

ENV_FILE="/opt/nt-csr-training/.duckdns.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Create it with DUCKDNS_DOMAIN and DUCKDNS_TOKEN." >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

if [ -z "${DUCKDNS_DOMAIN:-}" ] || [ -z "${DUCKDNS_TOKEN:-}" ]; then
  echo "ERROR: DUCKDNS_DOMAIN and DUCKDNS_TOKEN must both be set in $ENV_FILE." >&2
  exit 1
fi

curl -sk "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=" \
  > /var/log/duckdns.log 2>&1
