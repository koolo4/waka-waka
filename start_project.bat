@echo off
title CYBER-WAKA ANIME - Auto Setup and Start
color 0A

echo ===========================================
echo    CYBER-WAKA ANIME - AUTO STARTUP
echo ===========================================
echo.

echo [STEP 1/6] Installing Bun (if not installed)...
where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo Bun not found. Installing Bun...
    powershell -Command "Invoke-RestMethod -Uri https://bun.sh/install | Invoke-Expression"
) else (
    echo Bun already installed.
)
echo.

echo [STEP 2/6] Installing project dependencies...
bun install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo [STEP 3/6] Setting up Prisma database...
bun run db:generate
if %errorlevel% neq 0 (
    echo Error: Failed to generate Prisma client
    pause
    exit /b 1
)
echo Prisma client generated successfully!
echo.

echo [STEP 4/6] Running database migrations...
bun run db:migrate
if %errorlevel% neq 0 (
    echo Error: Failed to run database migrations
    pause
    exit /b 1
)
echo Database migrations completed!
echo.

echo [STEP 5/6] Seeding database with initial data...
bun run db:seed
if %errorlevel% neq 0 (
    echo Warning: Database seeding failed or already completed
    echo This is usually not critical, continuing...
) else (
    echo Database seeded successfully!
)
echo.

echo [STEP 6/6] Starting development server...
echo.
echo ===========================================
echo   SERVER WILL START ON: http://localhost:3000
echo ===========================================
echo.
echo Press Ctrl+C to stop the server
echo.

bun run dev
