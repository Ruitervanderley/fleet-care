#!/bin/bash

# Fleet Care - Publicar Imagens Docker

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "    FLEET CARE - PUBLICAR IMAGENS DOCKER"
echo "========================================"
echo -e "${NC}"

# Solicitar token e URL da API
read -p "Digite seu GitHub Personal Access Token (PAT): " GITHUB_TOKEN
read -p "Digite a URL da API (ex: http://192.168.1.8:30180): " API_URL

echo
echo -e "${BLUE}[1/5]${NC} Fazendo login no GitHub Container Registry..."
echo $GITHUB_TOKEN | docker login ghcr.io -u Ruitervanderley --password-stdin

if [ $? -ne 0 ]; then
    echo
    echo -e "${RED}❌ Falha ao fazer login no GitHub Container Registry.${NC}"
    echo "Verifique seu token e tente novamente."
    exit 1
fi

echo
echo -e "${BLUE}[2/5]${NC} Construindo imagem do backend..."
docker build -t ghcr.io/ruitervanderley/fleetcare-backend:latest -f backend/Dockerfile .

if [ $? -ne 0 ]; then
    echo
    echo -e "${RED}❌ Falha ao construir a imagem do backend.${NC}"
    exit 1
fi

echo
echo -e "${BLUE}[3/5]${NC} Enviando imagem do backend para o GHCR..."
docker push ghcr.io/ruitervanderley/fleetcare-backend:latest

if [ $? -ne 0 ]; then
    echo
    echo -e "${RED}❌ Falha ao enviar a imagem do backend.${NC}"
    exit 1
fi

echo
echo -e "${BLUE}[4/5]${NC} Construindo imagem do frontend..."
docker build --build-arg API_BASE=$API_URL -t ghcr.io/ruitervanderley/fleetcare-frontend:latest -f frontend/Dockerfile .

if [ $? -ne 0 ]; then
    echo
    echo -e "${RED}❌ Falha ao construir a imagem do frontend.${NC}"
    exit 1
fi

echo
echo -e "${BLUE}[5/5]${NC} Enviando imagem do frontend para o GHCR..."
docker push ghcr.io/ruitervanderley/fleetcare-frontend:latest

if [ $? -ne 0 ]; then
    echo
    echo -e "${RED}❌ Falha ao enviar a imagem do frontend.${NC}"
    exit 1
fi

echo
echo -e "${GREEN}✅ Imagens publicadas com sucesso no GitHub Container Registry!${NC}"
echo
echo "Você pode agora implantar o Fleet Care no TrueNAS usando:"
echo
echo "1. Acesse o TrueNAS"
echo "2. Vá para Apps"
echo "3. Clique em \"Custom App\""
echo "4. Configure com as seguintes imagens:"
echo "   - Backend: ghcr.io/ruitervanderley/fleetcare-backend:latest"
echo "   - Frontend: ghcr.io/ruitervanderley/fleetcare-frontend:latest"
echo
echo "Ou use o script deploy-truenas.sh para instalação automática."
echo

read -p "Pressione Enter para continuar..."