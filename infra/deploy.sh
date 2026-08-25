#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="aws-cert-simulator"
BUCKET_NAME="alvaro8317-aws-cert-simulator"
TEMPLATE_FILE="$(dirname "$0")/template.yaml"
PROJECT_ROOT="$(dirname "$0")/.."

# ─── Opcional: región y perfil ────────────────────────────────────────────────
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
AWS_PROFILE_ARG=""
if [[ -n "${AWS_PROFILE:-}" ]]; then
  AWS_PROFILE_ARG="--profile $AWS_PROFILE"
fi

echo "================================================"
echo "  AWS Cert Simulator — Deploy"
echo "  Stack  : $STACK_NAME"
echo "  Bucket : $BUCKET_NAME"
echo "  Region : $AWS_REGION"
echo "================================================"

# ─── 1. Desplegar / actualizar el stack de CloudFormation ─────────────────────
echo ""
echo "[1/2] Desplegando stack CloudFormation..."

aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE_FILE" \
  --parameter-overrides BucketName="$BUCKET_NAME" \
  --region "$AWS_REGION" \
  --no-fail-on-empty-changeset \
  $AWS_PROFILE_ARG

# ─── 2. Sincronizar archivos al bucket ────────────────────────────────────────
echo ""
echo "[2/2] Sincronizando archivos al bucket S3..."

aws s3 sync "$PROJECT_ROOT" "s3://$BUCKET_NAME" \
  --region "$AWS_REGION" \
  --delete \
  --exclude "node_modules/*" \
  --exclude "tests/*" \
  --exclude "infra/*" \
  --exclude ".git/*" \
  --exclude "*.md" \
  --exclude "package*.json" \
  --include "index.html" \
  --include "src/*" \
  --include "questions.json" \
  $AWS_PROFILE_ARG

# ─── Resultado ────────────────────────────────────────────────────────────────
echo ""
echo "✓ Deploy completado."
echo ""

WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text \
  $AWS_PROFILE_ARG)

echo "URL del sitio: $WEBSITE_URL"
echo ""
