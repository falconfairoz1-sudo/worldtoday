@echo off
echo Adding API Status widget to sidebar...

git add .
git commit -m "Add: API Status widget to right sidebar

- Create compact API status widget for sidebar
- Shows real-time API connection status
- Auto-refreshes every 30 seconds
- Manual refresh button for testing
- Clean design that fits with other widgets"

git push origin main

echo.
echo Redeploying frontend with API widget...
cd client
vercel --prod

echo.
echo ✅ API Status widget added to sidebar!
echo 🌐 Check your site: https://worldtoday.vercel.app
echo 📊 Look for the API Status widget in the right sidebar
echo.
pause