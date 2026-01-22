@echo off
REM Installation script for Next AI Draw.io Skill (Windows)

echo Installing Next AI Draw.io Skill...

REM Check if npx is available
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npx is not installed. Please install Node.js first.
    exit /b 1
)

REM Test the MCP server
echo Testing MCP server installation...
npx @next-ai-drawio/mcp-server@latest --version 2>nul || echo MCP server will be installed on first use

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
