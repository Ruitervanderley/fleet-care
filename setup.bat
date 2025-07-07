@echo off
echo ========================================
echo   Arruda Fleet Care - Setup Inicial
echo ========================================

echo.
echo 1. Copiando arquivo de exemplo...
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo ✅ Arquivo .env criado!
) else (
    echo ⚠️  Arquivo .env já existe
)

echo.
echo 2. Verificando planilha...
if exist "PRODUTIVIDADE EQUIPAMENTOS.xlsx" (
    echo ✅ Planilha encontrada: PRODUTIVIDADE EQUIPAMENTOS.xlsx
    echo    Tamanho: 
) else (
    echo ❌ Planilha não encontrada!
    echo    Coloque a planilha "PRODUTIVIDADE EQUIPAMENTOS.xlsx" na pasta raiz do projeto
    pause
    exit /b 1
)
for %%A in ("PRODUTIVIDADE EQUIPAMENTOS.xlsx") do echo    %%~zA bytes
echo Ô£à Planilha de exemplo encontrada: PRODUTIVIDADE EQUIPAMENTOS.xlsx
echo Atenção: Após o setup, o sistema buscará a planilha real conforme a configuração feita na interface (local, rede, S3, etc).

echo.
echo 3. Iniciando Docker...
docker compose up -d --build

echo.
echo ========================================
echo   Setup concluído!
echo ========================================
echo.
echo Acesse o Dashboard: http://localhost:5173
echo API Docs:           http://localhost:8000/docs
echo API Status:         http://localhost:8000
echo.
echo Aguarde alguns segundos para os containers inicializarem...
timeout /t 10 /nobreak >nul
echo.
echo Testando conexão...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend está funcionando!
) else (
    echo ⚠️  Backend ainda inicializando... aguarde mais alguns segundos
)

curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend está funcionando!
) else (
    echo ⚠️  Frontend ainda inicializando... aguarde mais alguns segundos
)
echo.
pause 