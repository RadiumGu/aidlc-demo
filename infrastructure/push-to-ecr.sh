#!/bin/bash
# =============================================================
# Build & Push all images to ECR
# Usage: bash push-to-ecr.sh [region] [account-id]
# =============================================================
set -euo pipefail

REGION="${1:-$(aws configure get region)}"
ACCOUNT="${2:-$(aws sts get-caller-identity --query Account --output text)}"
REGISTRY="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
TAG="${TAG:-latest}"

echo "=========================================="
echo "  Push to ECR: ${REGISTRY}"
echo "  Tag: ${TAG}"
echo "=========================================="

# ECR login
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"

SERVICES=("auth-service" "product-service" "points-service" "order-service" "api-gateway" "frontend")

for SVC in "${SERVICES[@]}"; do
  IMAGE="awsomeshop/${SVC}"
  FULL="${REGISTRY}/${IMAGE}:${TAG}"

  echo ""
  echo ">>> Building ${SVC}..."
  docker build -t "${IMAGE}:${TAG}" "../${SVC}"

  echo ">>> Tagging ${FULL}"
  docker tag "${IMAGE}:${TAG}" "${FULL}"

  echo ">>> Pushing ${FULL}"
  docker push "${FULL}"

  echo ">>> Done: ${SVC}"
done

echo ""
echo "=========================================="
echo "  All images pushed successfully!"
echo "=========================================="
