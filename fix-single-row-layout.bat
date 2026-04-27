@echo off
echo Fixing top 5 articles to display in single row on mobile desktop mode...

git add .
git commit -m "Fix: Display top 5 articles in single horizontal row on mobile desktop mode

- Modify ArticleGrid component to show top 5 articles in one row
- Simplify CSS layout to use flexbox with grid for top row
- Ensure 5-column layout is maintained in desktop mode on mobile
- Remaining articles display in responsive grid below
- Only apply mobile layout for very small portrait screens
- Perfect desktop experience when requesting desktop site on mobile"

git push origin main

echo.
echo Redeploying frontend with single row layout...
cd client
vercel --prod

echo.
echo ✅ Single row layout implemented!
echo 🌐 Test your site: https://worldtoday.vercel.app
echo 📱 On mobile, request desktop site
echo 🖥️ Top 5 articles will display in single horizontal row
echo 📊 Remaining articles will display in grid below
echo.
pause