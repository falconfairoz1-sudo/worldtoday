@echo off
echo Fixing backend CORS and frontend debugging...

git add .
git commit -m "Fix: Add CORS support for Vercel domains and debug API calls

- Add multiple allowed origins for CORS
- Add API debug component to frontend
- Add better error logging for API calls
- Fix Socket.io CORS configuration"

git push origin main

echo.
echo Backend will auto-redeploy on Render...
echo Waiting 30 seconds for backend to start redeploying...
timeout /t 30 /nobreak

echo.
echo Now redeploying frontend...
cd client
vercel --prod

echo.
echo ✅ Deployment complete!
echo.
echo 🔍 Check your site: https://worldtoday.vercel.app
echo 📊 You should see a debug box in the top-right corner
echo 🔧 If API still fails, check Render logs at: https://render.com
echo.
pause