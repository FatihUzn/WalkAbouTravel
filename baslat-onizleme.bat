@echo off
chcp 65001 >nul
title WalkAbout Travel - Yerel Onizleme
cd /d "%~dp0"

echo.
echo  ============================================
echo   WALKABOUT TRAVEL - YEREL ONIZLEME
echo  ============================================
echo.

where php >nul 2>nul
if %errorlevel%==0 goto :basla

if exist "C:\php\php.exe" set "PATH=C:\php;%PATH%" & goto :basla
if exist "%~dp0php\php.exe" set "PATH=%~dp0php;%PATH%" & goto :basla

echo  [!] PHP bulunamadi.
echo.
echo  Yapilacak:
echo    1. https://windows.php.net/download adresinden
echo       "VS17 x64 Thread Safe" ZIP dosyasini indir
echo    2. Icindekileri  C:\php  klasorune cikar
echo    3. Bu dosyayi tekrar cift tikla
echo.
pause
exit /b

:basla
php -v
echo.
echo  Sunucu baslatiliyor...
echo  Tarayicida ac:  http://localhost:8000
echo.
echo  Kapatmak icin bu pencerede CTRL+C
echo.
start "" http://localhost:8000
php -S localhost:8000 router.php
