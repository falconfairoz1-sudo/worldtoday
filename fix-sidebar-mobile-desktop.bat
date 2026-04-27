@echo off
echo Fixing sidebar visibility on mobile desktop mode...

git add .
git commit -m "Fix: Show sidebar widgets on mobile desktop mode

- Modify Home.css to show sidebar when viewport is 768px+ (desktop mode)
- Add force-desktop-layout class for JavaScript control
- Ensure sidebar displays with proper 2-column layout on mobile desktop
- Add responsive adjustments for sidebar widgets on smaller desktop screens
- Use !important rules to override mobile-first hiding
- Maintain proper spacing and layout in desktop mode on mobile"

git push origin main

echo.
echo Redeploying frontend with sidebar fix...
cd client
vercel --prod

echo.
echo ✅ Sidebar visibility fixed for mobile desktop mode!
echo 🌐 Test your site: https://worldtoday.vercel.app
echo 📱 On mobile, request desktop site
echo 📊 Sidebar widgets should now be visible on the right
echo 🔧 Includes: Weather, Stocks, Currency, API Status, Trending
echo.
pause