#!/bin/bash

set -e

if [[ -z "$PROJECT_ID" || -z "$REGION" || -z "$REPO_NAME" || -z "$SERVICE_NAME" ]]; then
  echo "Please export PROJECT_ID, REGION, REPO_NAME, and SERVICE_NAME before running this script."
  exit 1
fi

# Check if Artifact Registry repo exists, create if not
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" >/dev/null 2>&1; then
  echo "Creating Artifact Registry repository: $REPO_NAME in $REGION"
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION"
else
  echo "Artifact Registry repository $REPO_NAME already exists in $REGION"
fi

IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"

if [[ -f ./env-to-gcloud-envs.sh ]]; then
  ENV_VARS=$(./env-to-gcloud-envs.sh)
  echo "Environment variables to be set:"
  echo "$ENV_VARS"
else
  ENV_VARS=""
  echo "No env-to-gcloud-envs.sh found, skipping env vars."
fi

echo "Building Docker image..."
docker build -t "$IMAGE" .

echo "Pushing Docker image to Artifact Registry..."
docker push "$IMAGE"

echo "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  $( [[ -n "$ENV_VARS" ]] && echo --set-env-vars "$ENV_VARS" )

echo "Deployment complete."