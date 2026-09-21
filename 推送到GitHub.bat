@echo off
cd /d "%~dp0"

echo ========================================
echo   提交并推送到 GitHub（自动部署）
echo ========================================
echo.

git add -A
git commit -m "update site"
git push github HEAD:main

if errorlevel 1 (
  echo.
  echo [!] 推送失败，请试强制推送：
  echo     git push github HEAD:main --force
)

echo.
echo 完成。窗口不会自动关闭，看上面的提示。
pause
