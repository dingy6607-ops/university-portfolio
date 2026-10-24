@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   生成可安全发布的 dist 目录
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [X] 未找到 Node.js，请先安装：https://nodejs.org
  pause
  exit /b 1
)

node build.mjs
if errorlevel 1 (
  echo.
  echo [X] 构建安全检查未通过，已中止。
  pause
  exit /b 1
)

echo.
echo dist\ 已生成，里面只有可公开的文件（无 .git / .env / 备份包）。
echo.
echo 下一步任选其一：
echo   1) 把 dist 文件夹整个拖进 Cloudflare Pages 的部署页面
echo   2) 在项目根执行：npx wrangler pages deploy dist
echo.
echo 提示：不要上传项目根目录，根目录里有 .git。
echo.

start "" explorer "%~dp0dist"
pause
