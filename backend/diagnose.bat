@echo off
REM Backend Deployment Diagnostic Script (Windows)

echo 🔍 Backend Deployment Diagnostics
echo ==================================
echo.

REM Check Docker
echo 1️⃣ Checking Docker...
where docker >nul 2>nul
if %errorlevel% equ 0 (
    echo    ✅ Docker installed
    docker --version
) else (
    echo    ❌ Docker NOT installed
)
echo.

REM Check package.json
echo 2️⃣ Checking package.json...
if exist package.json (
    echo    ✅ package.json found
    find "@prisma/client" package.json >nul 2>&1 && echo    ✅ Prisma found || echo    ❌ Prisma not found
) else (
    echo    ❌ package.json NOT found
)
echo.

REM Check Prisma schema
echo 3️⃣ Checking Prisma configuration...
if exist prisma\schema.prisma (
    echo    ✅ schema.prisma found
) else (
    echo    ❌ schema.prisma NOT found
)
echo.

REM Check Dockerfile
echo 4️⃣ Checking Dockerfile...
if exist Dockerfile (
    echo    ✅ Dockerfile found
    findstr "openssl" Dockerfile >nul 2>&1 && echo    ✅ OpenSSL included || echo    ⚠️  OpenSSL NOT included
) else (
    echo    ❌ Dockerfile NOT found
)
echo.

REM Check environment
echo 5️⃣ Checking environment files...
if exist .env (
    echo    ✅ .env exists ^(⚠️  Don't commit this!^)
)
if exist .env.production (
    echo    ✅ .env.production exists
)
if exist node_modules (
    echo    ✅ node_modules installed
) else (
    echo    ⚠️  node_modules NOT installed ^(run: npm install^)
)
echo.

echo ==================================
echo ✅ Diagnostics complete!
echo.
echo 📋 Next steps:
echo    1. Review findings above
echo    2. If needed, update Dockerfile
echo    3. Run: npm install
echo    4. Test: npm run build
echo    5. Push: git push
echo    6. Check Render deployment
