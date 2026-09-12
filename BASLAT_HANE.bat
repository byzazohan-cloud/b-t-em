@echo off
title HANE v0.5 FINAL
cd /d "%~dp0"
echo.
echo ========================================
echo        HANE v0.5 BASLATILIYOR
echo ========================================
echo.
if not exist node_modules (
  echo ILK KURULUM YAPILIYOR. BIRAZ SUREBILIR...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo KURULUMDA HATA OLUSTU.
    pause
    exit /b 1
  )
)
if not exist node_modules\@expo\vector-icons (
  echo EKSIK IKON PAKETI TAMAMLANIYOR...
  call npm.cmd install
)
call npm.cmd run web
pause
