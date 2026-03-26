@echo off
REM Installation script for Draw.io Skill (Windows, desktop-first)

echo Installing Draw.io Skill...

REM Check if npx is available
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npx is not installed. Please install Node.js first.
    exit /b 1
)

REM Test the optional MCP server (non-interactive; do not start the stdio server here)
echo Checking optional live-edit MCP availability...
set MCP_VER=
for /f %%v in ('npm view @next-ai-drawio/mcp-server version 2^>nul') do set MCP_VER=%%v
if "%MCP_VER%"=="" (
    echo Info: Optional next-ai MCP not detected. The skill still works in offline/desktop mode.
) else (
    echo ✓ Optional next-ai MCP available: %MCP_VER%
)

echo.
echo Checking draw.io Desktop...
if not "%DRAWIO_CMD%"=="" (
    if exist "%DRAWIO_CMD%" (
        echo ✓ draw.io Desktop configured via DRAWIO_CMD: %DRAWIO_CMD%
        goto after_drawio_check
    )
)

if exist "C:\Program Files\draw.io\draw.io.exe" (
    echo ✓ draw.io Desktop found at C:\Program Files\draw.io\draw.io.exe
    goto after_drawio_check
)

if defined LOCALAPPDATA (
    if exist "%LOCALAPPDATA%\Programs\draw.io\draw.io.exe" (
        echo ✓ draw.io Desktop found at %LOCALAPPDATA%\Programs\draw.io\draw.io.exe
        goto after_drawio_check
    )
)

where drawio.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "delims=" %%p in ('where drawio.exe') do (
        echo ✓ draw.io Desktop found on PATH: %%p
        goto after_drawio_check
    )
)

echo Info: draw.io Desktop was not found. You can still generate .drawio and standalone SVG files.

:after_drawio_check
echo.
echo ✓ Draw.io Skill installed successfully!
echo.
echo Default mode: offline-first (YAML/CLI ^> .drawio + optional sidecars)
echo Optional enhancer: next-ai MCP for live browser editing
echo.
echo Usage examples:
echo   - Create a flowchart showing user authentication flow
echo   - Generate an AWS architecture diagram with Lambda and DynamoDB
echo   - Draw a sequence diagram for OAuth 2.0 flow
