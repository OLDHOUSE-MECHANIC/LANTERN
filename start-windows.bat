@echo off
title LANTERN Stream Server
color 0B

echo.
echo  =====================================
echo   LANTERN - Local Streaming Server
echo  =====================================
echo.

:: Check if .env exists and load TMDB key from it
if exist .env (
  for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="TMDB_API_KEY" set TMDB_API_KEY=%%b
  )
)

:: Check if node_modules exists, install if not
if not exist node_modules (
  echo  Installing server dependencies...
  call npm install
  echo.
)

if not exist client\node_modules (
  echo  Installing client dependencies...
  cd client
  call npm install
  cd ..
  echo.
)

:: Build client if no build folder
if not exist client\build (
  echo  Building the app (first time only, takes ~1 min)...
  cd client
  call npm run build
  cd ..
  echo.
)

echo  Starting LANTERN...
echo  Open http://localhost:3000 in your browser.
echo  Press Ctrl+C to stop.
echo.

npm start
pause
