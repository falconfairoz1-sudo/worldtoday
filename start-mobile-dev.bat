@echo off
echo Starting WorldToday for Mobile Development...
echo.

echo Step 1: Starting Backend Server...
cd server
start "Backend Server" cmd /c "npm start"
echo Backend will be available at: http://10.123.103.101:5000
echo.

echo Step 2: Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Step 3: Starting Frontend Server...
cd ..\client
start "Frontend Server" cmd /c "npm start"
echo Frontend will be available at: http://10.123.103.101:3000
echo.

echo ========================================
echo   MOBILE ACCESS INSTRUCTIONS
echo ========================================
echo 1. Make sure your mobile device is connected to the same WiFi network
echo 2. Open your mobile browser and go to: http://10.123.103.101:3000
echo 3. If it doesn't work, check your Windows Firewall settings
echo.
echo Press any key to continue...
pause > nul