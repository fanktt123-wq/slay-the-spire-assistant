@echo off
chcp 65001 >nul
title 杀戮尖塔助手

echo ==========================================
echo    杀戮尖塔助手 - 启动中...
echo ==========================================
echo.

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 https://nodejs.org/
    pause
    exit /b 1
)

:: 检查后端依赖
if not exist "backend\node_modules" (
    echo [安装] 后端依赖...
    cd backend
    call npm install
    cd ..
)

:: 启动后端
echo.
echo [启动] 正在启动服务...
echo.
echo 启动后会自动打开浏览器，然后点击你想用的功能：
echo   - 实时对战
echo   - 卡组构筑
echo   - 数据管理
echo.

cd backend
start http://localhost:3000
npm start
