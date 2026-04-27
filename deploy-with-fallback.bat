@echo off
echo Deploying enhanced API with fallback system...

git add .
git commit -m "Fix: Add fallback API system with mock data

- Enhanced API client with automatic fallback
- Mock data for development when backend is down
- Better error handling and logging
- Graceful degradation for better user experience"

git push origin main

echo.
echo Redeploying frontend with enhanced API...
cd client
vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo 🎯 Your site now has:
echo   - Primary API: https://worldtoday.onrender.com/api
echo   - Fallback: localhost:5000 (if available)
echo   - Mock data: If both APIs fail
echo.
echo 🔍 Check: https://worldtoday.vercel.app
echo 📊 The debug box will show which API is working
echo.
pause