@echo off
SETLOCAL

:: Variables
SET "BUCKET_NAME=dionys-frontend-ppl"
SET "DISTRIBUTION_ID=E2MWRU0094HI44"
SET "BUILD_FOLDER=out"
SET "AWS_PROFILE=digital-events-ppl-dev-frontend"

echo Replacing .env.local
copy /Y .env.development .env.local

:: Run the build command
echo Running npm build...
call npm run build

echo Restoring .env.local
copy /Y .env.local-copy .env.local

:: Sync build output to S3 with specified AWS profile
echo Deploying to S3 bucket: %BUCKET_NAME% using profile: %AWS_PROFILE%
aws s3 sync %BUILD_FOLDER% s3://%BUCKET_NAME% --delete --profile %AWS_PROFILE%

:: Create invalidation for CloudFront distribution
echo Invalidating CloudFront distribution: %DISTRIBUTION_ID%
aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*" --profile %AWS_PROFILE%

echo Deployment and invalidation complete.
ENDLOCAL
pause
