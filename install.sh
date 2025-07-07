#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "    FLEET CARE - INSTALADOR AUTOMATIZADO"
echo "========================================"
echo -e "${NC}"
echo "Este instalador irá configurar o sistema Fleet Care"
echo "em seu computador automaticamente."
echo ""

# Verificar se o Python está instalado
echo -e "${BLUE}[1/6] Verificando Python...${NC}"
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python encontrado${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    echo -e "${GREEN}✅ Python encontrado${NC}"
    PYTHON_CMD="python"
else
    echo -e "${RED}❌ Python não encontrado!${NC}"
    echo ""
    echo "Por favor, instale o Python 3.8+ de:"
    echo "https://www.python.org/downloads/"
    echo ""
    echo "Ou use o gerenciador de pacotes do seu sistema:"
    echo "Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "macOS: brew install python3"
    exit 1
fi

# Verificar se o Node.js está instalado
echo ""
echo -e "${BLUE}[2/6] Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js encontrado${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo ""
    echo "Por favor, instale o Node.js 16+ de:"
    echo "https://nodejs.org/"
    echo ""
    echo "Ou use o gerenciador de pacotes do seu sistema:"
    echo "Ubuntu/Debian: sudo apt install nodejs npm"
    echo "CentOS/RHEL: sudo yum install nodejs npm"
    echo "macOS: brew install node"
    exit 1
fi

# Verificar se o Docker está instalado (opcional)
echo ""
echo -e "${BLUE}[3/6] Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  Docker não encontrado (opcional)${NC}"
    echo "   O sistema funcionará sem Docker, mas recomenda-se instalar"
    echo "   para melhor gerenciamento de dependências."
fi

# Instalar dependências do backend
echo ""
echo -e "${BLUE}[4/6] Instalando dependências do Backend...${NC}"
cd backend

# Remover ambiente virtual anterior se existir
if [ -d "venv" ]; then
    echo "Removendo ambiente virtual anterior..."
    rm -rf venv
fi

echo "Criando ambiente virtual Python..."
$PYTHON_CMD -m venv venv

# Ativar ambiente virtual
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Instalando dependências Python..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do backend${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Backend configurado com sucesso${NC}"
fi

# Voltar para o diretório raiz
cd ..

# Instalar dependências do frontend
echo ""
echo -e "${BLUE}[5/6] Instalando dependências do Frontend...${NC}"
cd frontend

echo "Instalando dependências Node.js..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do frontend${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Frontend configurado com sucesso${NC}"
fi

# Voltar para o diretório raiz
cd ..

# Criar arquivos de configuração
echo ""
echo -e "${BLUE}[6/6] Criando arquivos de configuração...${NC}"

# Criar arquivo .env para o backend
if [ ! -f "backend/.env" ]; then
    echo "Criando arquivo de configuração do backend..."
    cp backend/env.example backend/.env
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

# Criar scripts de inicialização
echo ""
echo "Criando scripts de inicialização..."

# Script para iniciar o backend
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Iniciando Backend Fleet Care..."
cd backend
source venv/bin/activate
python app.py
EOF

# Script para iniciar o frontend
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Iniciando Frontend Fleet Care..."
cd frontend
npm run dev
EOF

# Script para iniciar tudo
cat > start-fleet-care.sh << 'EOF'
#!/bin/bash
echo "Iniciando Fleet Care..."
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Pressione qualquer tecla para iniciar o backend..."
read -n 1 -s
gnome-terminal -- bash -c "cd backend && source venv/bin/activate && python app.py; exec bash" &
sleep 3
echo "Iniciando frontend..."
gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash" &
echo ""
echo "Sistema iniciado!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
read -p "Pressione Enter para sair..."
EOF

# Tornar scripts executáveis
chmod +x start-backend.sh
chmod +x start-frontend.sh
chmod +x start-fleet-care.sh

echo -e "${GREEN}✅ Scripts de inicialização criados${NC}"

# Instalação concluída
echo ""
echo -e "${BLUE}========================================"
echo "    INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "========================================"
echo -e "${NC}"
echo "O Fleet Care foi instalado em seu computador."
echo ""
echo "Para iniciar o sistema, você pode:"
echo ""
echo "1. Usar o script completo:"
echo "   ./start-fleet-care.sh"
echo ""
echo "2. Ou iniciar separadamente:"
echo "   ./start-backend.sh    (Backend - porta 8000)"
echo "   ./start-frontend.sh   (Frontend - porta 5173)"
echo ""
echo "URLs de acesso:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:8000"
echo ""
echo "Documentação completa: README.md"
echo ""
read -p "Pressione Enter para sair..." 