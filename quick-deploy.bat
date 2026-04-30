@echo off
echo Building optimized client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo Deployment failed!
    pause
    exit /b 1
)

echo Deployment completed successfully!
echo Website: https://worldtoday.vercel.app
pause