@echo off
echo Deploying WorldToday to Vercel...
echo.

cd client

echo Step 1: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix the errors and try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Vercel...
echo Y | vercel --prod

echo.
echo Deployment complete!
echo Your website should be available at: https://worldtoday.vercel.app
echo Backend API: https://worldtoday.onrender.com
echo.
pause