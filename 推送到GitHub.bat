@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM ============================================================
REM  一键提交并推送到 GitHub
REM  配合 Cloudflare Pages 的 Git 集成，推送后会自动重新部署
REM ============================================================

REM 检查是否已配置名为 github 的远程仓库
git remote -v | findstr /i "github" >nul
if errorlevel 1 (
  echo.
  echo 还没有配置 GitHub 远程仓库，请先执行下面这行（把地址换成你的仓库）：
  echo.
  echo   git remote add github https://github.com/dingy6607-ops/university-portfolio.git
  echo.
  pause
  exit /b
)

set /p MSG=提交说明（直接回车使用默认 "update site"）：
if "%MSG%"=="" set MSG=update site

echo.
echo 正在提交：%MSG%
git add .
git commit -m "%MSG%"
if errorlevel 1 echo （没有文件变更，跳过提交）

echo.
echo 正在推送到 GitHub...
git push github HEAD:main
if errorlevel 1 (
  echo.
  echo 推送失败，如果你的默认分支是 master，把上面命令改成：
  echo   git push github HEAD:master
)

echo.
echo 完成！Cloudflare Pages 会在几十秒后自动重新部署。
pause
