@echo off
chcp 65001 >nul
title Fleet Care - Publicar Imagens Docker

echo.
echo ========================================
echo    FLEET CARE - PUBLICAR IMAGENS DOCKER
echo ========================================
echo.

set /p GITHUB_TOKEN="Digite seu GitHub Personal Access Token (PAT): "
set /p API_URL="Digite a URL da API (ex: http://192.168.1.8:30180): "

echo.
echo [1/5] Fazendo login no GitHub Container Registry...
echo %GITHUB_TOKEN% | docker login ghcr.io -u Ruitervanderley --password-stdin

if %errorlevel% neq 0 (
    echo.
    echo ❌ Falha ao fazer login no GitHub Container Registry.
    echo Verifique seu token e tente novamente.
    goto :exit
)

echo.
echo [2/5] Construindo imagem do backend...
docker build -t ghcr.io/ruitervanderley/fleetcare-backend:latest -f backend/Dockerfile .

if %errorlevel% neq 0 (
    echo.
    echo ❌ Falha ao construir a imagem do backend.
    goto :exit
)

echo.
echo [3/5] Enviando imagem do backend para o GHCR...
docker push ghcr.io/ruitervanderley/fleetcare-backend:latest

if %errorlevel% neq 0 (
    echo.
    echo ❌ Falha ao enviar a imagem do backend.
    goto :exit
)

echo.
echo [4/5] Construindo imagem do frontend...
docker build --build-arg API_BASE=%API_URL% -t ghcr.io/ruitervanderley/fleetcare-frontend:latest -f frontend/Dockerfile .

if %errorlevel% neq 0 (
    echo.
    echo ❌ Falha ao construir a imagem do frontend.
    goto :exit
)

echo.
echo [5/5] Enviando imagem do frontend para o GHCR...
docker push ghcr.io/ruitervanderley/fleetcare-frontend:latest

if %errorlevel% neq 0 (
    echo.
    echo ❌ Falha ao enviar a imagem do frontend.
    goto :exit
)

echo.
echo ✅ Imagens publicadas com sucesso no GitHub Container Registry!
echo.
echo Você pode agora implantar o Fleet Care no TrueNAS usando:
echo.
echo 1. Acesse o TrueNAS
echo 2. Vá para Apps
echo 3. Clique em "Custom App"
echo 4. Configure com as seguintes imagens:
echo    - Backend: ghcr.io/ruitervanderley/fleetcare-backend:latest
echo    - Frontend: ghcr.io/ruitervanderley/fleetcare-frontend:latest
echo.
echo Ou use o script deploy-truenas.sh para instalação automática.

:exit
echo.
pause