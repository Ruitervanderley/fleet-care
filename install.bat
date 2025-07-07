@echo off
chcp 65001 >nul
title Fleet Care - Instalador Automatizado

echo.
echo ========================================
echo    FLEET CARE - INSTALADOR AUTOMATIZADO
echo ========================================
echo.
echo Este instalador irá configurar o sistema Fleet Care
echo em seu computador automaticamente.
echo.

:: Verificar se o Python está instalado
echo [1/6] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    echo.
    echo Por favor, instale o Python 3.8+ de:
    echo https://www.python.org/downloads/
    echo.
    echo Certifique-se de marcar "Add Python to PATH" durante a instalação.
    pause
    exit /b 1
) else (
    echo ✅ Python encontrado
)

:: Verificar se o Node.js está instalado
echo.
echo [2/6] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js 16+ de:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado
)

:: Verificar se o Docker está instalado (opcional)
echo.
echo [3/6] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker não encontrado (opcional)
    echo    O sistema funcionará sem Docker, mas recomenda-se instalar
    echo    para melhor gerenciamento de dependências.
) else (
    echo ✅ Docker encontrado
)

:: Instalar dependências do backend
echo.
echo [4/6] Instalando dependências do Backend...
cd backend
if exist "venv" (
    echo Removendo ambiente virtual anterior...
    rmdir /s /q venv
)

echo Criando ambiente virtual Python...
python -m venv venv
call venv\Scripts\activate.bat

echo Instalando dependências Python...
pip install --upgrade pip
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do backend
    pause
    exit /b 1
) else (
    echo ✅ Backend configurado com sucesso
)

:: Voltar para o diretório raiz
cd ..

:: Instalar dependências do frontend
echo.
echo [5/6] Instalando dependências do Frontend...
cd frontend

echo Instalando dependências Node.js...
npm install

if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend
    pause
    exit /b 1
) else (
    echo ✅ Frontend configurado com sucesso
)

:: Voltar para o diretório raiz
cd ..

:: Criar arquivos de configuração
echo.
echo [6/6] Criando arquivos de configuração...

:: Criar arquivo .env para o backend
if not exist "backend\.env" (
    echo Criando arquivo de configuração do backend...
    copy backend\env.example backend\.env >nul
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env já existe
)

:: Criar scripts de inicialização
echo.
echo Criando scripts de inicialização...

:: Script para iniciar o backend
echo @echo off > start-backend.bat
echo chcp 65001 ^>nul >> start-backend.bat
echo title Fleet Care - Backend >> start-backend.bat
echo echo Iniciando Backend Fleet Care... >> start-backend.bat
echo cd backend >> start-backend.bat
echo call venv\Scripts\activate.bat >> start-backend.bat
echo python app.py >> start-backend.bat
echo pause >> start-backend.bat

:: Script para iniciar o frontend
echo @echo off > start-frontend.bat
echo chcp 65001 ^>nul >> start-frontend.bat
echo title Fleet Care - Frontend >> start-frontend.bat
echo echo Iniciando Frontend Fleet Care... >> start-frontend.bat
echo cd frontend >> start-frontend.bat
echo npm run dev >> start-frontend.bat
echo pause >> start-frontend.bat

:: Script para iniciar tudo
echo @echo off > start-fleet-care.bat
echo chcp 65001 ^>nul >> start-fleet-care.bat
echo title Fleet Care - Sistema Completo >> start-fleet-care.bat
echo echo Iniciando Fleet Care... >> start-fleet-care.bat
echo echo. >> start-fleet-care.bat
echo echo Backend: http://localhost:8000 >> start-fleet-care.bat
echo echo Frontend: http://localhost:5173 >> start-fleet-care.bat
echo echo. >> start-fleet-care.bat
echo echo Pressione qualquer tecla para iniciar o backend... >> start-fleet-care.bat
echo pause ^>nul >> start-fleet-care.bat
echo start "Backend" cmd /k "cd backend ^& call venv\Scripts\activate.bat ^& python app.py" >> start-fleet-care.bat
echo timeout /t 3 ^>nul >> start-fleet-care.bat
echo echo Iniciando frontend... >> start-fleet-care.bat
echo start "Frontend" cmd /k "cd frontend ^& npm run dev" >> start-fleet-care.bat
echo echo. >> start-fleet-care.bat
echo echo Sistema iniciado! >> start-fleet-care.bat
echo echo Backend: http://localhost:8000 >> start-fleet-care.bat
echo echo Frontend: http://localhost:5173 >> start-fleet-care.bat
echo echo. >> start-fleet-care.bat
echo pause >> start-fleet-care.bat

echo ✅ Scripts de inicialização criados

:: Instalação concluída
echo.
echo ========================================
echo    INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ========================================
echo.
echo O Fleet Care foi instalado em seu computador.
echo.
echo Para iniciar o sistema, você pode:
echo.
echo 1. Usar o script completo:
echo    start-fleet-care.bat
echo.
echo 2. Ou iniciar separadamente:
echo    start-backend.bat    (Backend - porta 8000)
echo    start-frontend.bat   (Frontend - porta 5173)
echo.
echo URLs de acesso:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8000
echo.
echo Documentação completa: README.md
echo.
echo Pressione qualquer tecla para sair...
pause >nul 