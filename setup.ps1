# Personal Expense Management Setup Script

Write-Host "🚀 Setting up Personal Expense Management Application..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running (optional - can use MongoDB Atlas)
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

# Copy environment files
Write-Host "Setting up environment files..." -ForegroundColor Cyan

if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend\.env from example" -ForegroundColor Green
    Write-Host "⚠️  Please update the JWT secrets in backend\.env for production" -ForegroundColor Yellow
} else {
    Write-Host "✅ backend\.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running (local) or set up MongoDB Atlas" -ForegroundColor White
Write-Host "2. Update JWT secrets in backend\.env for production" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start both frontend and backend" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend API: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Available commands:" -ForegroundColor Cyan
Write-Host "- npm run dev      : Start both frontend and backend" -ForegroundColor White
Write-Host "- npm run server   : Start only backend" -ForegroundColor White
Write-Host "- npm run client   : Start only frontend" -ForegroundColor White
Write-Host "- npm run build    : Build frontend for production" -ForegroundColor White
