@echo off
setlocal enabledelayedexpansion
title WalkAbout Travel - Klasor Duzenleme ve Temizlik
cd /d "%~dp0"

echo.
echo  ==================================================
echo   WALKABOUT TRAVEL - KLASOR DUZENLEME + TEMIZLIK
echo  ==================================================
echo.
echo  Bu betik HICBIR SEYI SILMEZ.
echo  Kullanilmayan dosyalari su klasorlere TASIR:
echo     _YEDEK-ORIJINAL  ... buyuk orijinal fotograflar (sakla)
echo     _SILINECEK       ... artik kullanilmayan dosyalar
echo.
echo  Siteyi test ettikten sonra bu klasorleri elle silebilirsin.
echo.
if not exist "assets" goto :yok
pause
echo.

echo  [1/5] assets\img klasoru olusturuluyor...
if not exist "assets\img" mkdir "assets\img"

echo  [2/5] Boyutlandirilmis gorseller assets\img icine tasiniyor...
set T=0
for %%S in (400 800 1600) do (
  for %%F in ("assets\*-%%S.webp") do (
    move /y "%%F" "assets\img\" >nul 2>&1
    if not errorlevel 1 set /a T+=1
  )
)
echo        !T! dosya tasindi.

echo  [3/5] Ic ice cikmis assets klasoru birlestiriliyor...
if exist "assets\assets\img" move /y "assets\assets\img\*.webp" "assets\img\" >nul 2>&1
if exist "assets\assets\*.webp"  move /y "assets\assets\*.webp"  "assets\img\" >nul 2>&1
if exist "assets\assets" rd /s /q "assets\assets" >nul 2>&1

echo  [4/5] Kullanilmayan orijinal fotograflar _YEDEK-ORIJINAL icine...
if not exist "_YEDEK-ORIJINAL" mkdir "_YEDEK-ORIJINAL"
set Y=0
for %%F in ("assets\*.webp" "assets\*.jpg" "assets\*.jpeg" "assets\*.png") do (
  move /y "%%F" "_YEDEK-ORIJINAL\" >nul 2>&1
  if not errorlevel 1 set /a Y+=1
)
echo        !Y! orijinal yedege alindi. ^(hero_background.mp4 yerinde kaldi^)

echo  [5/5] Kullanilmayan dosyalar _SILINECEK icine...
if not exist "_SILINECEK" mkdir "_SILINECEK"
for %%F in (Tours.js Blog.js style-v2.css old-index.html htaccess error_log CWV-REHBER.md keyword-arastirma.md REHBER-ASAMA3.md OKUBENI.txt) do (
  if exist "%%F" move /y "%%F" "_SILINECEK\" >nul 2>&1
)
if exist ".ftpquota"               move /y ".ftpquota"               "_SILINECEK\" >nul 2>&1
if exist "data\tours_backup.json"  move /y "data\tours_backup.json"  "_SILINECEK\" >nul 2>&1
if exist "data\tours-summary.json" move /y "data\tours-summary.json" "_SILINECEK\" >nul 2>&1
if exist "data\tours.bak.json"     move /y "data\tours.bak.json"     "_SILINECEK\" >nul 2>&1
if exist "data\blog-posts.bak.json" move /y "data\blog-posts.bak.json" "_SILINECEK\" >nul 2>&1
if exist "_DUZELTILMIS"            move /y "_DUZELTILMIS"            "_SILINECEK\" >nul 2>&1
if exist "cache" del /q "cache\*.php" >nul 2>&1

echo.
echo  ==================================================
echo   BITTI
echo  ==================================================
echo.
set G=0
for %%F in ("assets\img\*.webp") do set /a G+=1
echo    assets\img icinde: !G! gorsel   ^(358 olmali^)
echo.
echo    SIRADAKI ADIM:
echo      1. baslat-onizleme.bat ile siteyi ac ve kontrol et
echo      2. Her sey yolundaysa _YEDEK-ORIJINAL klasorunu
echo         baska bir diske tasi, _SILINECEK klasorunu sil
echo      3. Kalan dosyalari sunucuya yukle
echo.
pause
exit /b

:yok
echo  [HATA] assets klasoru bulunamadi.
echo  Bu dosyayi Walkabouttravel klasorunun ICINE koy ve tekrar calistir.
pause
