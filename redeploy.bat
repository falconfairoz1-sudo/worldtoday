@echo off
echo Committing backend fixes...
git add .
git commit -m "Fix: Update CORS and add root route for backend"
git push origin main

echo Backend will auto-redeploy on Render...
echo.
echo Now redeploying frontend to Vercel...
cd client
vercel --prod

echo.
echo Deployment complete!
echo Frontend: https://worldtoday.vercel.app
echo Backend: https://worldtoday.onrender.com
echo.
echo Wait 2-3 minutes for backend to restart, then test your site.
pause