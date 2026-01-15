@echo off
echo ============================================
echo Trading Platform - Automated Setup
echo ============================================
echo.

echo [1/5] Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL is not installed!
    echo.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo Or use the EDB installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
    echo.
    echo After installation:
    echo 1. Remember your postgres password
    echo 2. Run this script again
    echo.
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

echo [2/5] Creating database...
set /p PGPASSWORD="Enter PostgreSQL password: "
psql -U postgres -c "CREATE DATABASE trading_platform;" 2>nul
if %errorlevel% equ 0 (
    echo Database created successfully!
) else (
    echo Database might already exist, continuing...
)
echo.

echo [3/5] Setting up backend environment...
cd apps\api
if not exist .env (
    (
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_USERNAME=postgres
        echo DB_PASSWORD=%PGPASSWORD%
        echo DB_DATABASE=trading_platform
        echo JWT_SECRET=trading-platform-secret-key-change-in-production
        echo PORT=3001
    ) > .env
    echo Backend .env created!
) else (
    echo Backend .env already exists!
)

echo Installing backend dependencies...
call npm install
echo.

echo [4/5] Setting up frontend environment...
cd ..\web
if not exist .env.local (
    echo NEXT_PUBLIC_API_URL=http://localhost:3001 > .env.local
    echo Frontend .env.local created!
) else (
    echo Frontend .env.local already exists!
)

echo Installing frontend dependencies...
call npm install
echo.

echo [5/5] Setup complete!
echo.
echo ============================================
echo To start the application:
echo ============================================
echo.
echo 1. Start Backend:
echo    cd apps\api
echo    npm run start:dev
echo.
echo 2. Start Frontend (in a new terminal):
echo    cd apps\web
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:3000
echo.
echo ============================================
pause
