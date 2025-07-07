@echo off
echo ========================================
echo   Teste de Conectividade do Backend
echo ========================================

echo.
echo 1. Verificando se o container está rodando...
docker ps | findstr "fleet-care-backend"
if %errorlevel% neq 0 (
    echo ❌ Container do backend não está rodando!
    echo Iniciando backend...
    docker compose up -d backend
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Container do backend está rodando
)

echo.
echo 2. Testando conectividade...
echo Tentando conectar a http://localhost:8000/health

curl -s http://localhost:8000/health
if %errorlevel% equ 0 (
    echo.
    echo ✅ Backend está respondendo!
) else (
    echo.
    echo ❌ Backend não está respondendo
    echo Verificando logs do container...
    docker compose logs backend
)

echo.
echo 3. Testando endpoint do dashboard...
curl -s http://localhost:8000/dashboard
if %errorlevel% equ 0 (
    echo.
    echo ✅ Dashboard está funcionando!
) else (
    echo.
    echo ❌ Dashboard não está funcionando
)

echo.
echo 4. Testando endpoint de equipamentos...
curl -s http://localhost:8000/equipment
if %errorlevel% equ 0 (
    echo.
    echo ✅ Lista de equipamentos está funcionando!
) else (
    echo.
    echo ❌ Lista de equipamentos não está funcionando
)

echo.
echo ========================================
echo   Teste Concluído
echo ========================================
echo.
pause 