#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="picklist"
REGISTRY_TAG="jarebear/picklist"

echo "🔨 Building Docker image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

echo "🏷️ Tagging image as: $REGISTRY_TAG"
docker tag "$IMAGE_NAME" "$REGISTRY_TAG"

echo "📤 Pushing image to registry…"
docker push "$REGISTRY_TAG"

echo "✅ Script execution complete."
