@echo off
echo Fixing mobile desktop layout for top 5 articles...

git add .
git commit -m "Fix: Maintain desktop layout for top articles on mobile desktop mode

- Modify ArticleGrid CSS to preserve desktop layout by default
- Only apply mobile layout for very small portrait screens
- Add force-desktop-layout CSS class for JavaScript control
- Update viewport meta tag to allow user scaling
- Use !important rules to override mobile breakpoints
- Ensure 5-column layout is maintained when desktop site is requested"

git push origin main

echo.
echo Redeploying frontend with fixed layout...
cd client
vercel --prod

echo.
echo ✅ Mobile desktop layout fixed!
echo 🌐 Test your site: https://worldtoday.vercel.app
echo 📱 On mobile, request desktop site - layout should stay the same
echo 💻 Top 5 articles will maintain desktop grid layout
echo.
pause