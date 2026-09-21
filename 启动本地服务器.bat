@echo off
cd /d "%~dp0"

set "PY=C:\Users\admin\AppData\Local\Programs\Python\Python314\python.exe"

if exist "%PY%" (
  echo Starting local server: http://localhost:8000
  echo Press Ctrl+C in this window to stop.
  start "" http://localhost:8000
  "%PY%" -m http.server 8000
) else (
  echo Python not found at:
  echo %PY%
  echo Opening index.html directly instead.
  start "" index.html
)

pause
