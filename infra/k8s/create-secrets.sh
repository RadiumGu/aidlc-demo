#!/bin/bash
# 从 Secrets Manager 创建 K8s Secret
set -euo pipefail

NAMESPACE="awesomeshop"
SECRET_NAME="awesomeshop-db"
REGION="ap-northeast-1"

echo "Fetching credentials from Secrets Manager..."
CREDS=$(aws secretsmanager get-secret-value \
  --secret-id awesomeshop/db-credentials \
  --region "$REGION" \
  --query SecretString --output text)

DB_HOST="awesomeshopinfra-awesomeshopmysql36bf1715-7hlgoeulquaq.czbjnsviioad.ap-northeast-1.rds.amazonaws.com"
DB_USERNAME=$(echo "$CREDS" | jq -r .username)
DB_PASSWORD=$(echo "$CREDS" | jq -r .password)
DB_NAME="awesomeshop"
REDIS_HOST="awesomeshop-redis.y0gdwo.0001.apne1.cache.amazonaws.com"

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic "$SECRET_NAME" \
  -n "$NAMESPACE" \
  --from-literal=db-host="$DB_HOST" \
  --from-literal=db-username="$DB_USERNAME" \
  --from-literal=db-password="$DB_PASSWORD" \
  --from-literal=db-name="$DB_NAME" \
  --from-literal=redis-host="$REDIS_HOST" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secret $SECRET_NAME created in namespace $NAMESPACE"
