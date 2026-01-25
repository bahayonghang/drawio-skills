@echo off
REM Installation script for Next AI Draw.io Skill (Windows)

echo Installing Next AI Draw.io Skill...

REM Check if npx is available
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npx is not installed. Please install Node.js first.
    exit /b 1
)

REM Test the MCP server (non-interactive; do not start the stdio server here)
echo Testing MCP server availability...
set MCP_VER=
for /f %%v in ('npm view @next-ai-drawio/mcp-server version 2^>nul') do set MCP_VER=%%v
if "%MCP_VER%"=="" (
    echo Warning: Unable to query @next-ai-drawio/mcp-server version. It will be installed on first use.
) else (
    echo ✓ @next-ai-drawio/mcp-server version: %MCP_VER%
)

echo.
echo ✓ Next AI Draw.io Skill installed successfully!
echo.
echo The MCP server will be automatically started when you use this skill.
echo Default port: 6002 (will auto-increment if in use)
echo.
echo Usage examples:
echo   - Create a flowchart showing user authentication flow
echo   - Generate an AWS architecture diagram with Lambda and DynamoDB
echo   - Draw a sequence diagram for OAuth 2.0 flow
