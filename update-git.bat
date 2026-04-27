@echo off
echo Updating all changes to Git...

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Update: Add API Status widget and fix backend issues

- Add API Status widget to right sidebar for real-time monitoring
- Fix backend variable declaration order (allowedOrigins)
- Enhanced API client with fallback system and mock data
- Improved error handling and logging
- Clean up debug components
- Ready for production deployment"

echo Pushing to GitHub...
git push origin main

echo.
echo ✅ All changes updated to Git!
echo 📊 Changes include:
echo   - API Status widget in sidebar
echo   - Backend startup fixes
echo   - Enhanced API error handling
echo   - Production-ready configuration
echo.
pause