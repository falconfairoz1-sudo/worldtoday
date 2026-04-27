@echo off
echo ========================================
echo   WORLDTODAY PRODUCTION CONFIG CHECK
echo ========================================
echo.

echo Checking Frontend Configuration...
echo --------------------------------
echo Development API URL:
type client\.env
echo.
echo Production API URL:
type client\.env.production
echo.

echo Checking Backend CORS Configuration...
echo ------------------------------------
findstr /n "allowedOrigins" server\index.js
echo.

echo Checking API Utility Configuration...
echo -----------------------------------
findstr /n "PRIMARY_API_URL" client\src\utils\api.js
echo.

echo ========================================
echo   EXPECTED CONFIGURATION
echo ========================================
echo Frontend URL: https://worldtoday.vercel.app
echo Backend URL:  https://worldtoday.onrender.com
echo API Endpoint: https://worldtoday.onrender.com/api
echo.
echo Both environments should use the production backend URL
echo for consistent behavior across all devices.
echo.
pause