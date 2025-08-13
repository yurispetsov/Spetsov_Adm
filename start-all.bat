@echo off
setlocal ENABLEDELAYEDEXPANSION

:: --- Settings ---
set MOCK_DIR=C:\shop-mock
set SITE_DIR=C:\site
set MOCK_PORT=5050
set DEV_PORT=5173

:: --- Start json-server in a new window ---
echo Starting mock API on port %MOCK_PORT%...
start "mock-api" cmd /k "cd /d %MOCK_DIR% && json-server --watch db.json --port %MOCK_PORT%"

:: Wait a moment for the mock to boot
timeout /t 2 >nul

:: --- Start Vite dev server ---
echo Starting Vite dev server on http://localhost:%DEV_PORT% ...
cd /d %SITE_DIR%
:: Ensure .env exists
if not exist ".env" (
  echo VITE_API_URL=http://localhost:%MOCK_PORT%> ".env"
  echo VITE_APP_NAME=Shop Admin>> ".env"
)

:: Run dev (stays in this window)
npm run dev
