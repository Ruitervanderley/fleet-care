#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker não está rodando. Inicie o Docker primeiro."
        exit 1
    fi
}

# Função para atualizar dependências
update_dependencies() {
    print_status "Atualizando dependências..."
    
    print_status "Parando containers..."
    docker-compose down
    
    print_status "Atualizando imagens Docker..."
    docker-compose pull
    
    print_status "Reconstruindo containers..."
    docker-compose build --no-cache
    
    print_status "Iniciando sistema..."
    docker-compose up -d
    
    print_success "Dependências atualizadas com sucesso!"
}

# Função para verificar vulnerabilidades
check_vulnerabilities() {
    print_status "Verificando vulnerabilidades..."
    
    if command_exists npm; then
        print_status "Verificando vulnerabilidades do frontend..."
        cd frontend && npm audit && cd ..
    fi
    
    if command_exists pip-audit; then
        print_status "Verificando vulnerabilidades do backend..."
        cd backend && pip-audit && cd ..
    fi
    
    print_status "Verificando imagens Docker..."
    docker scout cves fleet-care-frontend:latest 2>/dev/null || print_warning "Docker Scout não disponível"
    docker scout cves fleet-care-backend:latest 2>/dev/null || print_warning "Docker Scout não disponível"
    
    print_success "Verificação de vulnerabilidades concluída!"
}

# Função para limpeza e reconstrução
clean_rebuild() {
    print_status "Limpando e reconstruindo..."
    
    print_status "Parando containers..."
    docker-compose down
    
    print_status "Removendo containers antigos..."
    docker system prune -f
    
    print_status "Limpando cache do npm..."
    cd frontend
    rm -rf node_modules package-lock.json
    npm cache clean --force
    cd ..
    
    print_status "Limpando cache do pip..."
    cd backend
    pip cache purge 2>/dev/null || print_warning "pip cache purge não disponível"
    cd ..
    
    print_status "Reinstalando dependências..."
    cd frontend && npm install && cd ..
    cd backend && pip install -r requirements.txt && cd ..
    
    print_status "Reconstruindo containers..."
    docker-compose build --no-cache
    docker-compose up -d
    
    print_success "Limpeza e reconstrução concluídas!"
}

# Função para backup
create_backup() {
    print_status "Criando backup do sistema..."
    
    BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
    BACKUP_DIR="backups"
    
    print_status "Criando diretório de backup..."
    mkdir -p "$BACKUP_DIR"
    
    print_status "Backup dos arquivos de configuração..."
    mkdir -p "$BACKUP_DIR/config_$BACKUP_DATE"
    cp *.yml *.json *.md "$BACKUP_DIR/config_$BACKUP_DATE/" 2>/dev/null || true
    
    print_status "Backup dos dados..."
    docker-compose exec -T backend tar czf - /app/data > "$BACKUP_DIR/data_$BACKUP_DATE.tar.gz" 2>/dev/null || print_warning "Não foi possível fazer backup dos dados"
    
    print_status "Backup das imagens Docker..."
    docker save fleet-care-frontend:latest > "$BACKUP_DIR/frontend_$BACKUP_DATE.tar" 2>/dev/null || print_warning "Não foi possível salvar imagem frontend"
    docker save fleet-care-backend:latest > "$BACKUP_DIR/backend_$BACKUP_DATE.tar" 2>/dev/null || print_warning "Não foi possível salvar imagem backend"
    
    print_success "Backup criado em: $BACKUP_DIR/"
}

# Função para deploy completo
full_deploy() {
    print_status "Realizando deploy completo..."
    
    print_status "Verificando pré-requisitos..."
    docker --version
    docker-compose --version
    
    print_status "Parando todos os containers..."
    docker-compose down
    
    print_status "Removendo containers antigos..."
    docker system prune -f
    
    print_status "Atualizando imagens..."
    docker-compose pull
    
    print_status "Reconstruindo containers..."
    docker-compose build --no-cache
    
    print_status "Iniciando sistema..."
    docker-compose up -d
    
    print_status "Aguardando inicialização..."
    sleep 10
    
    print_status "Verificando status..."
    docker-compose ps
    
    print_success "Deploy completo realizado com sucesso!"
}

# Função para verificar performance
check_performance() {
    print_status "Verificando performance..."
    
    print_status "Verificando uso de recursos..."
    docker stats --no-stream
    
    print_status "Verificando logs de erro..."
    docker-compose logs --tail=50 | grep -i error || print_status "Nenhum erro encontrado"
    
    print_status "Verificando conectividade..."
    if curl -s http://localhost:3000 >/dev/null; then
        print_success "Frontend acessível"
    else
        print_error "Frontend não acessível"
    fi
    
    if curl -s http://localhost:8000 >/dev/null; then
        print_success "Backend acessível"
    else
        print_error "Backend não acessível"
    fi
    
    print_status "Verificando espaço em disco..."
    df -h
    
    print_success "Verificação de performance concluída!"
}

# Função para instalar no TrueNAS
install_truenas() {
    print_status "Instalando no TrueNAS..."
    
    print_status "Verificando pré-requisitos..."
    if ! command_exists docker; then
        print_error "Docker não está instalado. Instale o Docker primeiro."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose não está instalado. Instale o Docker Compose primeiro."
        exit 1
    fi
    
    print_status "Criando diretório de instalação..."
    mkdir -p /opt/fleet-care
    cp -r . /opt/fleet-care/
    cd /opt/fleet-care
    
    print_status "Configurando permissões..."
    chmod +x update-system.sh
    
    print_status "Iniciando sistema..."
    docker-compose up -d
    
    print_status "Aguardando inicialização..."
    sleep 15
    
    print_status "Verificando status..."
    docker-compose ps
    
    print_success "Instalação no TrueNAS concluída!"
    print_status "Acesse o sistema em: http://seu-servidor:3000"
}

# Menu principal
show_menu() {
    echo
    echo "========================================"
    echo "    FLEET CARE - SISTEMA DE ATUALIZAÇÃO"
    echo "========================================"
    echo
    echo "Escolha uma opção:"
    echo
    echo "[1] Atualizar dependências"
    echo "[2] Verificar vulnerabilidades"
    echo "[3] Limpar cache e reconstruir"
    echo "[4] Backup do sistema"
    echo "[5] Deploy completo"
    echo "[6] Verificar performance"
    echo "[7] Instalar no TrueNAS"
    echo "[8] Sair"
    echo
}

# Loop principal
while true; do
    show_menu
    read -p "Digite sua escolha (1-8): " choice
    
    case $choice in
        1)
            check_docker
            update_dependencies
            ;;
        2)
            check_docker
            check_vulnerabilities
            ;;
        3)
            check_docker
            clean_rebuild
            ;;
        4)
            check_docker
            create_backup
            ;;
        5)
            check_docker
            full_deploy
            ;;
        6)
            check_docker
            check_performance
            ;;
        7)
            install_truenas
            ;;
        8)
            echo
            echo "Obrigado por usar o Fleet Care!"
            echo
            exit 0
            ;;
        *)
            print_error "Opção inválida!"
            ;;
    esac
    
    echo
    read -p "Pressione Enter para continuar..."
done 