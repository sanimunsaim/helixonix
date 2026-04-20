# ============================================================
#  HelixOnix — One-Click Dev Launcher
#  Starts all 5 services in separate PowerShell windows
# ============================================================
#
#  Services & Ports:
#   ⚡  Core API      → http://localhost:3000
#   🧠  HELIX-BRAIN   → http://localhost:3001
#   🛍️  Buyer Website → http://localhost:5173
#   🎨  Seller Website→ http://localhost:5174
#   ⚙️  Admin Website → http://localhost:5175
#
# ============================================================

$Root = $PSScriptRoot

Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host "   HelixOnix — Development Environment Launcher" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host ""

# ── Helper ───────────────────────────────────────────────────
function Launch-Service {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Command,
        [string]$Color = "White"
    )
    Write-Host "  ▶  $Title" -ForegroundColor $Color
    Start-Process powershell `
        -WorkingDirectory $WorkDir `
        -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle='$Title'; $Command"
}

# ── 0. Docker Infra (Postgres, Redis, Typesense) ────────────
Write-Host "[ DOCKER INFRA ]" -ForegroundColor Magenta
Write-Host ""

try {
    docker info | Out-Null
    Write-Host "  ✅  Docker is running." -ForegroundColor Green
    Write-Host "  ▶  Starting PostgreSQL, Redis, Typesense containers..." -ForegroundColor Magenta
    Push-Location "$Root\Brain Backend\core-api"
    docker compose up -d postgres redis typesense 2>&1 | Out-Null
    Pop-Location
    Write-Host "  ✅  Infra containers are up." -ForegroundColor Green
} catch {
    Write-Host "  ❌  Docker Desktop is NOT running!" -ForegroundColor Red
    Write-Host "      Please open Docker Desktop and wait for it to fully load," -ForegroundColor Yellow
    Write-Host "      then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

Write-Host ""

# ── 1. Backend Services ───────────────────────────────────────
Write-Host "[ BACKENDS ]" -ForegroundColor Yellow
Write-Host ""

Launch-Service `
    -Title  "[HelixOnix] Core API  :3000" `
    -WorkDir "$Root\Brain Backend\core-api" `
    -Command "npm run dev" `
    -Color  "Yellow"

Start-Sleep -Milliseconds 500

Launch-Service `
    -Title  "[HelixOnix] HELIX-BRAIN  :3001" `
    -WorkDir "$Root\Brain Backend\helix-brain" `
    -Command "npm run dev" `
    -Color  "Yellow"

Write-Host ""
Write-Host "  ⏳  Waiting 6 seconds for backends to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 6

# ── 2. Frontend Services ──────────────────────────────────────
Write-Host ""
Write-Host "[ FRONTENDS ]" -ForegroundColor Green
Write-Host ""

Launch-Service `
    -Title  "[HelixOnix] Buyer Website  :5173" `
    -WorkDir "$Root\Buyer Website\app" `
    -Command "npm run dev" `
    -Color  "Green"

Start-Sleep -Milliseconds 300

Launch-Service `
    -Title  "[HelixOnix] Seller Website  :5174" `
    -WorkDir "$Root\Seller Website\app" `
    -Command "npm run dev" `
    -Color  "Green"

Start-Sleep -Milliseconds 300

Launch-Service `
    -Title  "[HelixOnix] Admin Website  :5175" `
    -WorkDir "$Root\Admin Website\app" `
    -Command "npm run dev" `
    -Color  "Green"

Write-Host ""
Write-Host "  ⏳  Waiting 8 seconds for frontends to compile..." -ForegroundColor DarkGray
Start-Sleep -Seconds 8

# ── 3. Open Browser Tabs ──────────────────────────────────────
Write-Host ""
Write-Host "[ BROWSER ]" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🌐  Opening all tabs in your default browser..." -ForegroundColor Cyan

Start-Process "http://localhost:5173"
Start-Sleep -Milliseconds 600
Start-Process "http://localhost:5174"
Start-Sleep -Milliseconds 600
Start-Process "http://localhost:5175"

# ── Done ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host "   ✅  All services launched successfully!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "   🛍️   Buyer    →  http://localhost:5173" -ForegroundColor White
Write-Host "   🎨   Seller   →  http://localhost:5174" -ForegroundColor White
Write-Host "   ⚙️    Admin    →  http://localhost:5175" -ForegroundColor White
Write-Host "   ⚡   Core API →  http://localhost:3000" -ForegroundColor White
Write-Host "   🧠   Brain    →  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "   Close the individual terminal windows to stop each service." -ForegroundColor DarkGray
Write-Host ""
