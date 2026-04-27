@echo off
echo Removing debug component and cleaning up...

git add .
git commit -m "Remove: API debug component and clean up logging

- Remove ApiTest debug component from Home page
- Clean up console logging
- Restore clean production appearance"

git push origin main

echo.
echo Redeploying clean frontend...
cd client
vercel --prod

echo.
echo ✅ Debug component removed!
echo 🌐 Your clean site: https://worldtoday.vercel.app
echo.
pause