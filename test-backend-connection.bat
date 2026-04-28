@echo off
echo Testing Backend Connection...
echo ========================================
echo.

echo Testing Backend Health Check...
curl -s https://worldtoday.onrender.com/health
echo.
echo.

echo Testing News API - General Category...
curl -s "https://worldtoday.onrender.com/api/news?category=general&limit=5"
echo.
echo.

echo Testing News API - Politics Category...
curl -s "https://worldtoday.onrender.com/api/news?category=politics&limit=5"
echo.
echo.

echo Testing News API - Technology Category...
curl -s "https://worldtoday.onrender.com/api/news?category=technology&limit=5"
echo.
echo.

echo ========================================
echo Test completed. Check the responses above.
echo If you see JSON data, the backend is working.
echo If you see errors, there might be backend issues.
echo.
pause