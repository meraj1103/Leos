@echo off
title Leos - Mobile Sharing & Android Setup
cd /d "%~dp0"

echo =======================================================
echo          LEOS - ANDROID & MOBILE QUICK CONNECT
echo =======================================================
echo.
echo Make sure your Android device is on the SAME Wi-Fi network as this laptop.
echo.
echo Detecting your Laptop's Wi-Fi / Local IP Address:
echo -------------------------------------------------------
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.InterfaceAlias -notlike '*vEthernet*' -and $_.InterfaceAlias -notlike '*WSL*' -and $_.IPAddress -notlike '169.254*' } | Sort-Object -Property InterfaceIndex | Select-Object -ExpandProperty IPAddress -First 1)"`) do (
    set LOCAL_IP=%%a
)
if "%LOCAL_IP%"=="" (
    for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0') do (
        set LOCAL_IP=%%a
    )
)
echo.
echo [1] On your Android Phone / Tablet:
echo     Open Chrome or your mobile browser.
echo.
echo [2] Navigate to:
echo     http://%LOCAL_IP%:5173  (or the Network URL displayed below)
echo.
echo [3] Tap the green "Install App" button at the top, or tap
echo     Chrome Menu (...) -^> "Add to Home screen" / "Install Leos".
echo.
echo -------------------------------------------------------
echo Starting Local Network Server with --host ...
echo -------------------------------------------------------
echo.

call npm run dev -- --host
pause
