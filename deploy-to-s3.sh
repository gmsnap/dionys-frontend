#!/bin/bash

# Variables
BUCKET_NAME="dionys-frontend-ppl"
DISTRIBUTION_ID="E2MWRU0094HI44"
BUILD_FOLDER="out"
AWS_PROFILE="digital-events-ppl-dev-frontend"

# Run the build command
echo "Running npm build..."
npm run build

# Sync build output to S3 with specified AWS profile
echo "Deploying to S3 bucket: $BUCKET_NAME using profile: $AWS_PROFILE"
aws s3 sync $BUILD_FOLDER s3://$BUCKET_NAME --delete --profile $AWS_PROFILE

# Create invalidation for CloudFront distribution
echo "Invalidating CloudFront distribution: $DISTRIBUTION_ID"
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --profile $AWS_PROFILE

echo "Deployment and invalidation complete."
