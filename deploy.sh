#!/bin/bash
# deploy.sh — build and deploy skill-registry to S3 + CloudFront
set -e

BUCKET="skill-registry-512492730598"
REGION="us-east-1"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:-E1M1C3NSVDON3J}"

# ── 1. Build ──────────────────────────────────────────────────────
echo "Building..."
npm run build

# ── 2. Sync to S3 ────────────────────────────────────────────────
echo "Syncing to s3://$BUCKET..."
aws s3 sync dist/ "s3://$BUCKET" \
  --delete \
  --region "$REGION" \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" \
  --exclude "skills-manifest.json" \
  --exclude "prompts/*"

# HTML + manifest + prompts: no-cache so updates are instant
aws s3 sync dist/ "s3://$BUCKET" \
  --delete \
  --region "$REGION" \
  --cache-control "no-cache" \
  --include "*.html" \
  --include "skills-manifest.json" \
  --include "prompts/*"

# ── 3. CloudFront invalidation ────────────────────────────────────
if [ -n "$CF_DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront ($CF_DISTRIBUTION_ID)..."
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DISTRIBUTION_ID" \
    --paths "/*" \
    --region "$REGION"
else
  echo "Skipping CloudFront invalidation (CF_DISTRIBUTION_ID not set)."
  echo "Set it in your shell: export CF_DISTRIBUTION_ID=XXXXXXXXXXXX"
fi

echo "Done! https://$(aws cloudfront list-distributions --query \"DistributionList.Items[?Origins.Items[0].DomainName=='$BUCKET.s3.amazonaws.com'].DomainName\" --output text 2>/dev/null || echo '<your-cf-domain>.cloudfront.net')"
