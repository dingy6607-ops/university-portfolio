@echo off
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  echo 正在启动本地服务器： http://localhost:8000
  start "" http://localhost:8000
  python -m http.server 8000
) else (
  echo 未检测到 Python，改用直接打开网页文件的方式。
  start "" "%~dp0index.html"
)
pause
