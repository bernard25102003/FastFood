#!/bin/bash
# Backend Deployment Diagnostic Script

echo "🔍 Backend Deployment Diagnostics"
echo "=================================="
echo ""

# Check Docker
echo "1️⃣ Checking Docker..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker installed: $(docker --version)"
else
    echo "   ❌ Docker NOT installed"
fi
echo ""

# Check package.json
echo "2️⃣ Checking package.json..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json found"
    NODE_VERSION=$(grep -o '"engines".*' package.json || echo "not specified")
    PRISMA_VERSION=$(grep "@prisma/client" package.json || echo "not found")
    echo "   - Prisma: $PRISMA_VERSION"
else
    echo "   ❌ package.json NOT found"
fi
echo ""

# Check Prisma schema
echo "3️⃣ Checking Prisma configuration..."
if [ -f "prisma/schema.prisma" ]; then
    echo "   ✅ schema.prisma found"
    DATABASE=$(grep "datasource db" prisma/schema.prisma)
    PROVIDER=$(grep "provider.*=" prisma/schema.prisma | head -1)
    echo "   - $PROVIDER"
else
    echo "   ❌ schema.prisma NOT found"
fi
echo ""

# Check Dockerfile
echo "4️⃣ Checking Dockerfile..."
if [ -f "Dockerfile" ]; then
    echo "   ✅ Dockerfile found"
    BASE_IMAGE=$(head -1 Dockerfile | grep -o 'FROM.*')
    echo "   - Base: $BASE_IMAGE"
    HAS_OPENSSL=$(grep -c "openssl" Dockerfile || echo 0)
    if [ "$HAS_OPENSSL" -gt 0 ]; then
        echo "   ✅ OpenSSL included"
    else
        echo "   ⚠️  OpenSSL NOT included (may cause issues)"
    fi
else
    echo "   ❌ Dockerfile NOT found"
fi
echo ""

# Check environment
echo "5️⃣ Checking environment files..."
if [ -f ".env" ]; then
    echo "   ✅ .env exists (⚠️  Don't commit this!)"
fi
if [ -f ".env.production" ]; then
    echo "   ✅ .env.production exists"
fi
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules installed"
    PRISMA_CLI=$(ls node_modules/.bin/prisma 2>/dev/null && echo "✅" || echo "❌")
    echo "   - Prisma CLI: $PRISMA_CLI"
else
    echo "   ⚠️  node_modules NOT installed (run: npm install)"
fi
echo ""

# Try building Docker image
echo "6️⃣ Attempting Docker build (dry run)..."
if command -v docker &> /dev/null; then
    echo "   Building image..."
    if docker build -t backend-test:latest . --progress=plain 2>&1 | head -20; then
        echo "   ✅ Docker build succeeded"
    else
        echo "   ❌ Docker build failed"
    fi
else
    echo "   ⏭️  Skipping (Docker not available)"
fi
echo ""

echo "=================================="
echo "✅ Diagnostics complete!"
echo ""
echo "📋 Recommended next steps:"
echo "   1. Review findings above"
echo "   2. If OpenSSL missing, update Dockerfile"
echo "   3. Run: npm install"
echo "   4. Test locally: npm run build"
echo "   5. Push to GitHub: git push"
echo "   6. Check Render deployment"
