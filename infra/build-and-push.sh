#!/bin/bash
set -euo pipefail

ECR_REGISTRY="926093770964.dkr.ecr.ap-northeast-1.amazonaws.com"
TAG="v1"
BASE_DIR="/home/ubuntu/tech/aidlc-demo"
DOCKERFILE_JAVA="$BASE_DIR/infra/docker/Dockerfile.java"
DOCKERFILE_FE="$BASE_DIR/infra/docker/Dockerfile.frontend"

JAVA_SERVICES=("auth-service" "product-service" "points-service" "order-service" "gateway-service")
PIDS=()
RESULTS=()

echo "🔨 Building Java services in parallel..."

for svc in "${JAVA_SERVICES[@]}"; do
  IMG="$ECR_REGISTRY/awesomeshop/$svc:$TAG"
  echo "  Building $svc → $IMG"
  (
    cd "$BASE_DIR/$svc"
    docker build -t "$IMG" -f "$DOCKERFILE_JAVA" . 2>&1 | tail -3
    docker push "$IMG" 2>&1 | tail -2
    echo "✅ $svc pushed"
  ) &
  PIDS+=($!)
done

# Wait for all Java builds
FAIL=0
for i in "${!PIDS[@]}"; do
  if wait "${PIDS[$i]}"; then
    RESULTS+=("✅ ${JAVA_SERVICES[$i]}")
  else
    RESULTS+=("❌ ${JAVA_SERVICES[$i]}")
    FAIL=1
  fi
done

echo ""
echo "🎨 Building frontend..."
cd "$BASE_DIR/frontend"
docker build -t "$ECR_REGISTRY/awesomeshop/frontend:$TAG" -f "$DOCKERFILE_FE" . 2>&1 | tail -3
docker push "$ECR_REGISTRY/awesomeshop/frontend:$TAG" 2>&1 | tail -2
RESULTS+=("✅ frontend")

echo ""
echo "========== Build Results =========="
for r in "${RESULTS[@]}"; do
  echo "  $r"
done

if [ $FAIL -ne 0 ]; then
  echo "❌ Some builds failed!"
  exit 1
fi
echo "✅ All images built and pushed!"
