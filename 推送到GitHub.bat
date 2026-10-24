@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   安全检查 + 提交并推送到 GitHub
echo ========================================
echo.

git add -A

where node >nul 2>nul
if errorlevel 1 (
  echo [!] 未检测到 Node.js，已跳过本地安全检查。
  echo     建议安装后重试：https://nodejs.org
) else (
  node scripts\guard.mjs
  if errorlevel 1 (
    echo.
    echo [X] 检测到敏感文件，已中止推送。
    echo     处理完上面的文件后，重新双击本脚本。
    pause
    exit /b 1
  )

  node build.mjs
  if errorlevel 1 (
    echo.
    echo [X] 构建安全检查未通过，已中止推送。
    pause
    exit /b 1
  )
)

git commit -m "update site"
git push github HEAD:main

if errorlevel 1 (
  echo.
  echo [!] 推送失败。若提示 remote 已存在，可直接执行：
  echo     git push github HEAD:main
)

echo.
echo 完成。窗口不会自动关闭，看上面的提示。
pause
