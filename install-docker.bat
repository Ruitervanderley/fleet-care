@echo off
chcp 65001 >nul
title Fleet Care - Instalador Docker

echo.
echo ========================================
echo    FLEET CARE - INSTALADOR DOCKER
echo ========================================
echo.
echo Este instalador irá configurar o sistema Fleet Care
echo usando Docker para facilitar a instalação.
echo.

:: Verificar se o Docker está instalado
echo [1/4] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado!
    echo.
    echo Por favor, instale o Docker Desktop de:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo Após a instalação, reinicie o computador e tente novamente.
    pause
    exit /b 1
) else (
    echo ✅ Docker encontrado
)

:: Verificar se o Docker está rodando
echo.
echo [2/4] Verificando se o Docker está rodando...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando!
    echo.
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
) else (
    echo ✅ Docker está rodando
)

:: Criar diretório de dados
echo.
echo [3/4] Criando estrutura de dados...
if not exist "data" mkdir data
if not exist "ssl" mkdir ssl
echo ✅ Estrutura de dados criada

:: Construir e iniciar containers
echo.
echo [4/4] Construindo e iniciando containers...
echo.
echo Isso pode levar alguns minutos na primeira execução...
echo.

docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ❌ Erro ao iniciar containers
    echo.
    echo Verifique se:
    echo - Docker Desktop está rodando
    echo - As portas 8000, 5173, 80, 443 não estão em uso
    echo - Você tem permissões de administrador
    pause
    exit /b 1
) else (
    echo ✅ Containers iniciados com sucesso
)

:: Aguardar inicialização
echo.
echo Aguardando inicialização dos serviços...
timeout /t 10 /nobreak >nul

:: Verificar status dos containers
echo.
echo Verificando status dos containers...
docker-compose ps

:: Instalação concluída
echo.
echo ========================================
echo    INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ========================================
echo.
echo O Fleet Care foi instalado e está rodando!
echo.
echo URLs de acesso:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8000
echo - Nginx (proxy): http://localhost
echo.
echo Comandos úteis:
echo - Ver logs: docker-compose logs -f
echo - Parar sistema: docker-compose down
echo - Reiniciar: docker-compose restart
echo - Atualizar: docker-compose pull && docker-compose up -d
echo.
echo Pressione qualquer tecla para abrir o sistema...
pause >nul

:: Abrir navegador
start http://localhost:5173

echo.
echo Sistema aberto no navegador!
echo.
pause 