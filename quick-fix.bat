@echo off
echo Fixing variable declaration order...

git add .
git commit -m "Fix: Resolve allowedOrigins variable declaration order

- Move allowedOrigins declaration before Socket.io usage
- Fix JavaScript scope issue causing startup failure
- Clean up duplicate array declarations"

git push origin main

echo.
echo ✅ Quick fix pushed to GitHub
echo 🔄 Render will auto-redeploy in 30-60 seconds
echo.
echo ⏳ Waiting for backend deployment...
timeout /t 90 /nobreak

echo.
echo Testing backend health...
curl -I https://worldtoday.onrender.com/health

echo.
echo Redeploying frontend...
cd client
vercel --prod

echo.
echo ✅ Fix complete!
echo 🌐 Test your site: https://worldtoday.vercel.app
echo 🔧 Backend health: https://worldtoday.onrender.com/health
echo.
pause