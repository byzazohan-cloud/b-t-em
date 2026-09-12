@echo off
title HANE v0.5.4 SAFE
cd /d "%~dp0"
echo.
echo =========================================
echo      HANE v0.5.4 HAZIRLANIYOR
echo =========================================
echo.
if exist HANE_BUILD_LOG.txt del HANE_BUILD_LOG.txt
call npm.cmd install >> HANE_BUILD_LOG.txt 2>&1
if errorlevel 1 (
  echo PAKET KURULUM HATASI.
  echo HANE_BUILD_LOG.txt DOSYASINI GONDER.
  pause
  exit /b 1
)
if exist dist rmdir /s /q dist
call npm.cmd run build:iphone >> HANE_BUILD_LOG.txt 2>&1
if errorlevel 1 (
  echo BUILD HATASI.
  echo HANE_BUILD_LOG.txt DOSYASINI GONDER.
  pause
  exit /b 1
)
echo.
echo HAZIR. YENI DIST KLASORU ACILIYOR.
explorer "%~dp0dist"
pause
