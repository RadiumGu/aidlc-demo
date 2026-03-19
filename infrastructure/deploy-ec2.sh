#!/bin/bash
# =============================================================
# AWSomeShop EC2 Deployment (ECR mode)
# Run on EC2 after CDK deploy
# Usage: bash deploy-ec2.sh
# =============================================================
set -euo pipefail

APP_DIR="/home/ec2-user/awsomeshop/infrastructure"

# Get region via IMDSv2 (requires token)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region)
ACCOUNT=$(aws sts get-caller-identity --query Account --output text --region "$REGION")
ECR_REGISTRY="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"

echo "=========================================="
echo "  AWSomeShop EC2 Deploy (ECR)"
echo "  Region: ${REGION}"
echo "  Registry: ${ECR_REGISTRY}"
echo "=========================================="

# 1. ECR login
echo "[1/4] ECR login..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

# 2. Check .env
echo "[2/4] Checking environment..."
if [ ! -f "$APP_DIR/.env" ]; then
  echo "ERROR: $APP_DIR/.env not found"
  echo "Create it from .env.production and set real passwords"
  exit 1
fi

# 3. Pull & start
echo "[3/4] Pulling images and starting containers..."
export ECR_REGISTRY
cd "$APP_DIR"
docker compose -f docker-compose.ecr.yml pull
docker compose -f docker-compose.ecr.yml down 2>/dev/null || true
docker compose -f docker-compose.ecr.yml up -d

# 4. Health check
echo "[4/4] Waiting for services..."
sleep 10
for i in $(seq 1 30); do
  HEALTHY=$(docker compose -f docker-compose.ecr.yml ps --format json 2>/dev/null | grep -c '"healthy"' || true)
  TOTAL=$(docker compose -f docker-compose.ecr.yml ps --format json 2>/dev/null | wc -l | tr -d ' ')
  echo "  Check $i/30: $HEALTHY/$TOTAL healthy"
  if [ "$HEALTHY" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
    echo ""
    echo "=========================================="
    echo "  All $TOTAL containers healthy!"
    echo "=========================================="
    exit 0
  fi
  sleep 10
done

echo "WARNING: Not all containers healthy after 5 min"
docker compose -f docker-compose.ecr.yml ps
exit 1
