@echo off
echo Fixing backend startup issues...

git add .
git commit -m "Fix: Resolve backend startup issues for Render deployment

- Add comprehensive error handling for database connection
- Validate required environment variables on startup
- Add safer route loading with error handling
- Improve logging for better debugging
- Bind server to 0.0.0.0 for Render compatibility"

git push origin main

echo.
echo ✅ Backend fixes pushed to GitHub
echo 🔄 Render will auto-redeploy in 1-2 minutes
echo.
echo 📊 Check deployment status at: https://render.com/dashboard
echo 🔍 Once backend is live, test: https://worldtoday.onrender.com/health
echo.
echo ⏳ Wait for backend to deploy, then redeploy frontend...
timeout /t 120 /nobreak

echo.
echo Redeploying frontend...
cd client
vercel --prod

echo.
echo ✅ All deployments complete!
echo 🌐 Frontend: https://worldtoday.vercel.app
echo 🔧 Backend: https://worldtoday.onrender.com
echo.
pause