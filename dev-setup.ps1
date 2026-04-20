# ╔══════════════════════════════════════════════════════════╗
# ║         HelixOnix — Full Dev Environment Setup           ║
# ╚══════════════════════════════════════════════════════════╝
# Run this script AFTER Docker Desktop is open and running.
# Usage: Right-click → "Run with PowerShell" OR run in terminal:
#        .\dev-setup.ps1

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n🔷 $msg" -ForegroundColor Cyan
}
function Write-OK($msg) {
    Write-Host "  ✅ $msg" -ForegroundColor Green
}
function Write-Warn($msg) {
    Write-Host "  ⚠️  $msg" -ForegroundColor Yellow
}

$CoreApiDir  = "$PSScriptRoot\Brain Backend\core-api"
$BrainDir    = "$PSScriptRoot\Brain Backend\helix-brain"
$BuyerDir    = "$PSScriptRoot\Buyer Website\app"
$SellerDir   = "$PSScriptRoot\Seller Website\app"
$AdminDir    = "$PSScriptRoot\Admin Website\app"

# ─── 1. Check Docker is running ─────────────────────────────
Write-Step "Checking Docker..."
try {
    docker info | Out-Null
    Write-OK "Docker is running."
} catch {
    Write-Host "`n❌ Docker Desktop is NOT running." -ForegroundColor Red
    Write-Host "   Please open Docker Desktop, wait for the whale icon in taskbar, then re-run this script." -ForegroundColor Yellow
    exit 1
}

# ─── 2. Start infra containers (postgres, redis, typesense) ─
Write-Step "Starting PostgreSQL, Redis, Typesense via Docker..."
Push-Location $CoreApiDir
docker compose up -d postgres redis typesense
Pop-Location
Write-OK "Containers started."

# ─── 3. Wait for postgres to be ready ───────────────────────
Write-Step "Waiting for PostgreSQL to be ready..."
$retries = 20
$ready   = $false
for ($i = 0; $i -lt $retries; $i++) {
    $health = docker inspect --format='{{.State.Health.Status}}' (docker compose -f "$CoreApiDir\docker-compose.yml" ps -q postgres 2>$null) 2>$null
    if ($health -eq "healthy") { $ready = $true; break }
    Write-Host "  ⏳ Waiting... ($($i+1)/$retries)" -ForegroundColor DarkGray
    Start-Sleep 3
}
if (-not $ready) {
    Write-Warn "Postgres health check timed out, but continuing anyway..."
} else {
    Write-OK "PostgreSQL is ready."
}

# ─── 4. Install Core API dependencies if needed ─────────────
Write-Step "Checking Core API dependencies..."
if (-not (Test-Path "$CoreApiDir\node_modules")) {
    Write-Host "  📦 Installing npm packages..." -ForegroundColor DarkGray
    Push-Location $CoreApiDir
    npm install
    Pop-Location
}
Write-OK "Core API dependencies ready."

# ─── 5. Run DB migrations ────────────────────────────────────
Write-Step "Running database migrations..."
Push-Location $CoreApiDir
npm run db:migrate
Pop-Location
Write-OK "Migrations complete."

# ─── 6. Seed database ────────────────────────────────────────
Write-Step "Seeding database with test users..."
Push-Location $CoreApiDir
npm run db:seed
Pop-Location
Write-OK "Seed complete. Test accounts:"
Write-Host "    admin@helixonix.com  / Password123!" -ForegroundColor Magenta
Write-Host "    seller@helixonix.com / Password123!" -ForegroundColor Magenta
Write-Host "    buyer@helixonix.com  / Password123!" -ForegroundColor Magenta

# ─── 7. Install frontend dependencies if needed ─────────────
Write-Step "Checking frontend dependencies..."
foreach ($dir in @($BuyerDir, $SellerDir, $AdminDir)) {
    if (-not (Test-Path "$dir\node_modules")) {
        $name = Split-Path (Split-Path $dir) -Leaf
        Write-Host "  📦 Installing $name..." -ForegroundColor DarkGray
        Push-Location $dir; npm install; Pop-Location
    }
}
Write-OK "Frontend dependencies ready."

# ─── 8. Print next steps ────────────────────────────────────
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅  Setup complete! Now run: .\start-all.ps1            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🌐 Buyer  → http://localhost:5173" -ForegroundColor White
Write-Host "  🛒 Seller → http://localhost:5174" -ForegroundColor White
Write-Host "  🔧 Admin  → http://localhost:5175" -ForegroundColor White
Write-Host "  🔌 API    → http://localhost:3000" -ForegroundColor White
Write-Host ""
