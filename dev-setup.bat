@echo off
echo ========================================
echo   Arruda Fleet Care - Dev Setup
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
) else (
    echo ❌ Planilha não encontrada!
    echo    Coloque a planilha "PRODUTIVIDADE EQUIPAMENTOS.xlsx" na pasta raiz do projeto
    pause
    exit /b 1
)

echo.
echo 3. Reiniciando Backend com CORS...
docker compose restart backend

echo.
echo 4. Aguardando backend inicializar...
timeout /t 10 /nobreak >nul

echo.
echo 5. Instalando dependências do Frontend...
cd frontend
if not exist "node_modules" (
    echo Instalando dependências...
    npm install
) else (
    echo Dependências já instaladas
)

echo.
echo 6. Iniciando Frontend em modo desenvolvimento...
echo.
echo ========================================
echo   Setup de Desenvolvimento Concluído!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173 (desenvolvimento)
echo.
echo Aguarde o frontend inicializar...
echo.
npm run dev

node -v
npm -v

npm install chart.js react-chartjs-2 --save 