@echo off
chcp 65001 >nul
title Fleet Care - Sistema de Atualização

echo.
echo ========================================
echo    FLEET CARE - SISTEMA DE ATUALIZAÇÃO
echo ========================================
echo.

:menu
echo Escolha uma opção:
echo.
echo [1] Atualizar dependências
echo [2] Verificar vulnerabilidades
echo [3] Limpar cache e reconstruir
echo [4] Backup do sistema
echo [5] Deploy completo
echo [6] Verificar performance
echo [7] Sair
echo.
set /p choice="Digite sua escolha (1-7): "

if "%choice%"=="1" goto update_deps
if "%choice%"=="2" goto check_vulns
if "%choice%"=="3" goto clean_rebuild
if "%choice%"=="4" goto backup
if "%choice%"=="5" goto full_deploy
if "%choice%"=="6" goto check_performance
if "%choice%"=="7" goto exit
goto menu

:update_deps
echo.
echo ========================================
echo    ATUALIZANDO DEPENDÊNCIAS
echo ========================================
echo.

echo [1/4] Parando containers...
docker-compose down

echo [2/4] Atualizando imagens Docker...
docker-compose pull

echo [3/4] Reconstruindo containers...
docker-compose build --no-cache

echo [4/4] Iniciando sistema...
docker-compose up -d

echo.
echo ✅ Dependências atualizadas com sucesso!
echo.
pause
goto menu

:check_vulns
echo.
echo ========================================
echo    VERIFICANDO VULNERABILIDADES
echo ========================================
echo.

echo [1/3] Verificando vulnerabilidades do frontend...
cd frontend
npm audit
cd ..

echo [2/3] Verificando vulnerabilidades do backend...
cd backend
pip-audit
cd ..

echo [3/3] Verificando imagens Docker...
docker scout cves fleet-care-frontend:latest
docker scout cves fleet-care-backend:latest

echo.
echo ✅ Verificação de vulnerabilidades concluída!
echo.
pause
goto menu

:clean_rebuild
echo.
echo ========================================
echo    LIMPEZA E RECONSTRUÇÃO
echo ========================================
echo.

echo [1/6] Parando containers...
docker-compose down

echo [2/6] Removendo containers antigos...
docker system prune -f

echo [3/6] Limpando cache do npm...
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
cd ..

echo [4/6] Limpando cache do pip...
cd backend
pip cache purge
cd ..

echo [5/6] Reinstalando dependências...
cd frontend
npm install
cd ..

cd backend
pip install -r requirements.txt
cd ..

echo [6/6] Reconstruindo containers...
docker-compose build --no-cache
docker-compose up -d

echo.
echo ✅ Limpeza e reconstrução concluídas!
echo.
pause
goto menu

:backup
echo.
echo ========================================
echo    BACKUP DO SISTEMA
echo ========================================
echo.

set backup_date=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set backup_date=%backup_date: =0%

echo [1/4] Criando diretório de backup...
if not exist "backups" mkdir backups

echo [2/4] Backup dos arquivos de configuração...
xcopy "*.yml" "backups\config_%backup_date%\"
xcopy "*.json" "backups\config_%backup_date%\"
xcopy "*.md" "backups\config_%backup_date%\"

echo [3/4] Backup dos dados...
docker-compose exec -T backend tar czf - /app/data > "backups\data_%backup_date%.tar.gz"

echo [4/4] Backup das imagens Docker...
docker save fleet-care-frontend:latest > "backups\frontend_%backup_date%.tar"
docker save fleet-care-backend:latest > "backups\backend_%backup_date%.tar"

echo.
echo ✅ Backup criado em: backups\
echo.
pause
goto menu

:full_deploy
echo.
echo ========================================
echo    DEPLOY COMPLETO
echo ========================================
echo.

echo [1/8] Verificando pré-requisitos...
docker --version
docker-compose --version

echo [2/8] Parando todos os containers...
docker-compose down

echo [3/8] Removendo containers antigos...
docker system prune -f

echo [4/8] Atualizando imagens...
docker-compose pull

echo [5/8] Reconstruindo containers...
docker-compose build --no-cache

echo [6/8] Iniciando sistema...
docker-compose up -d

echo [7/8] Aguardando inicialização...
timeout /t 10 /nobreak

echo [8/8] Verificando status...
docker-compose ps

echo.
echo ✅ Deploy completo realizado com sucesso!
echo.
pause
goto menu

:check_performance
echo.
echo ========================================
echo    VERIFICAÇÃO DE PERFORMANCE
echo ========================================
echo.

echo [1/4] Verificando uso de recursos...
docker stats --no-stream

echo [2/4] Verificando logs de erro...
docker-compose logs --tail=50 | findstr "ERROR"

echo [3/4] Verificando conectividade...
curl -s http://localhost:3000 >nul
if %errorlevel%==0 (
    echo ✅ Frontend acessível
) else (
    echo ❌ Frontend não acessível
)

curl -s http://localhost:8000 >nul
if %errorlevel%==0 (
    echo ✅ Backend acessível
) else (
    echo ❌ Backend não acessível
)

echo [4/4] Verificando espaço em disco...
wmic logicaldisk get size,freespace,caption

echo.
echo ✅ Verificação de performance concluída!
echo.
pause
goto menu

:exit
echo.
echo Obrigado por usar o Fleet Care!
echo.
exit 