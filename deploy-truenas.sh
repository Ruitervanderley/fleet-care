#!/bin/bash

# 🚀 Fleet Care - Deploy Rápido para TrueNAS
# Versão: 2.0.0

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}"
    echo "========================================"
    echo "    FLEET CARE - DEPLOY RÁPIDO"
    echo "========================================"
    echo -e "${NC}"
}

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

# Verificar se é root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script deve ser executado como root"
        exit 1
    fi
}

# Verificar pré-requisitos
check_prerequisites() {
    print_status "Verificando pré-requisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado"
        print_status "Instalando Docker..."
        pkg install -y docker
        sysrc docker_enable="YES"
        service docker start
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_status "Instalando Docker Compose..."
        pip install docker-compose
    fi
    
    print_success "Pré-requisitos verificados!"
}

# Configurar diretório de instalação
setup_installation() {
    print_status "Configurando instalação..."
    
    # Criar diretório de instalação
    INSTALL_DIR="/opt/fleet-care"
    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR
    
    # Se estamos no diretório do projeto, copiar arquivos
    if [[ -f "docker-compose.yml" ]]; then
        print_status "Copiando arquivos do projeto..."
        cp -r . $INSTALL_DIR/
    else
        print_error "Arquivos do projeto não encontrados"
        print_status "Por favor, execute este script no diretório do projeto"
        exit 1
    fi
    
    # Configurar permissões
    chmod +x update-system.sh
    chmod +x deploy-truenas.sh
    
    print_success "Instalação configurada!"
}

# Configurar variáveis de ambiente
setup_environment() {
    print_status "Configurando variáveis de ambiente..."
    
    # Criar arquivo .env se não existir
    if [[ ! -f ".env" ]]; then
        cat > .env << EOF
# Configurações do Backend
BACKEND_PORT=8000
DATABASE_URL=sqlite:///app/data/fleet_care.db

# Configurações do Frontend
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8000

# Configurações de Rede (ajustar conforme necessário)
NETWORK_SHARE_PATH=//servidor/ARRUDA GERAL/Arruda Transporte de Lenha/APONTAMENTOS/PRODUÇÃO E EFICIÊNCIA
NETWORK_USERNAME=seu_usuario
NETWORK_PASSWORD=sua_senha

# Configurações de SSL (opcional)
SSL_CERT_PATH=/etc/ssl/certs/fleet-care.crt
SSL_KEY_PATH=/etc/ssl/private/fleet-care.key
EOF
        print_warning "Arquivo .env criado. Ajuste as configurações conforme necessário."
    fi
    
    print_success "Variáveis de ambiente configuradas!"
}

# Configurar backup automático
setup_backup() {
    print_status "Configurando backup automático..."
    
    # Criar script de backup
    cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/mnt/tank/backups/fleet-care"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

mkdir -p $BACKUP_DIR

# Backup dos dados
docker-compose exec -T backend tar czf - /app/data > $BACKUP_DIR/data_$DATE.tar.gz 2>/dev/null || echo "Backup de dados falhou"

# Backup das configurações
tar czf $BACKUP_DIR/config_$DATE.tar.gz *.yml *.json *.md .env 2>/dev/null || echo "Backup de configurações falhou"

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "Backup criado: $BACKUP_DIR/"
EOF
    
    chmod +x backup.sh
    
    # Adicionar ao cron se não existir
    if ! crontab -l 2>/dev/null | grep -q "backup.sh"; then
        echo "0 2 * * * /opt/fleet-care/backup.sh" | crontab -
        print_success "Backup automático configurado!"
    else
        print_status "Backup automático já configurado"
    fi
}

# Configurar atualizações automáticas
setup_auto_update() {
    print_status "Configurando atualizações automáticas..."
    
    # Criar script de atualização automática
    cat > auto-update.sh << 'EOF'
#!/bin/bash
cd /opt/fleet-care

# Fazer backup antes da atualização
./backup.sh

# Atualizar sistema (se usar Git)
if [[ -d ".git" ]]; then
    git pull origin main
fi

# Atualizar containers
docker-compose pull
docker-compose build --no-cache
docker-compose up -d

# Limpar imagens antigas
docker image prune -f

echo "Sistema atualizado: $(date)"
EOF
    
    chmod +x auto-update.sh
    
    # Adicionar ao cron se não existir
    if ! crontab -l 2>/dev/null | grep -q "auto-update.sh"; then
        echo "0 3 * * 0 /opt/fleet-care/auto-update.sh" | crontab -
        print_success "Atualizações automáticas configuradas!"
    else
        print_status "Atualizações automáticas já configuradas"
    fi
}

# Configurar proxy reverso (opcional)
setup_proxy() {
    read -p "Deseja configurar proxy reverso (Nginx)? [y/N]: " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Configurando proxy reverso..."
        
        # Instalar Nginx
        pkg install -y nginx
        
        # Configurar Nginx
        cat > /usr/local/etc/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream fleet_care_backend {
        server 127.0.0.1:8000;
    }
    
    upstream fleet_care_frontend {
        server 127.0.0.1:3000;
    }
    
    server {
        listen 80;
        server_name _;
        
        location /api/ {
            proxy_pass http://fleet_care_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location / {
            proxy_pass http://fleet_care_frontend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
        
        # Iniciar Nginx
        sysrc nginx_enable="YES"
        service nginx start
        
        print_success "Proxy reverso configurado!"
    fi
}

# Iniciar sistema
start_system() {
    print_status "Iniciando sistema..."
    
    # Iniciar containers usando imagens do GHCR
    docker-compose pull
    docker-compose up -d
    
    # Aguardar inicialização
    print_status "Aguardando inicialização..."
    sleep 15
    
    # Verificar status
    print_status "Verificando status..."
    docker-compose ps
    
    print_success "Sistema iniciado!"
}

# Verificar conectividade
check_connectivity() {
    print_status "Verificando conectividade..."
    
    # Aguardar um pouco mais
    sleep 10
    
    # Verificar frontend
    if curl -s http://localhost:3000 >/dev/null; then
        print_success "Frontend acessível em: http://localhost:3000"
    else
        print_warning "Frontend não acessível. Verifique os logs."
    fi
    
    # Verificar backend
    if curl -s http://localhost:8000/dashboard >/dev/null; then
        print_success "Backend acessível em: http://localhost:8000"
    else
        print_warning "Backend não acessível. Verifique os logs."
    fi
}

# Mostrar informações finais
show_final_info() {
    print_header
    print_success "Deploy concluído com sucesso!"
    echo
    echo "📋 Informações importantes:"
    echo
    echo "🐳 Imagens Docker:"
    echo "   - Backend: ghcr.io/ruitervanderley/fleetcare-backend:latest"
    echo "   - Frontend: ghcr.io/ruitervanderley/fleetcare-frontend:latest"
    echo
    echo "🌐 Acesso ao sistema:"
    echo "   - Frontend: http://$(hostname -I | awk '{print $1}'):3000"
    echo "   - Backend:  http://$(hostname -I | awk '{print $1}'):8000"
    echo
    echo "📁 Diretório de instalação: /opt/fleet-care"
    echo
    echo "🔧 Comandos úteis:"
    echo "   - Status: docker-compose ps"
    echo "   - Logs: docker-compose logs -f"
    echo "   - Backup: ./backup.sh"
    echo "   - Atualizar: ./update-system.sh"
    echo "   - Parar: docker-compose down"
    echo "   - Reiniciar: docker-compose restart"
    echo
    echo "📅 Tarefas agendadas:"
    echo "   - Backup diário: 02:00"
    echo "   - Atualização semanal: Domingo 03:00"
    echo
    echo "⚠️  IMPORTANTE:"
    echo "   - Ajuste as configurações de rede no arquivo .env"
    echo "   - Configure o firewall se necessário"
    echo "   - Monitore os logs regularmente"
    echo
}

# Função principal
main() {
    print_header
    
    # Verificar se é root
    check_root
    
    # Verificar pré-requisitos
    check_prerequisites
    
    # Configurar instalação
    setup_installation
    
    # Configurar ambiente
    setup_environment
    
    # Configurar backup
    setup_backup
    
    # Configurar atualizações automáticas
    setup_auto_update
    
    # Configurar proxy (opcional)
    setup_proxy
    
    # Iniciar sistema
    start_system
    
    # Verificar conectividade
    check_connectivity
    
    # Mostrar informações finais
    show_final_info
}

# Executar função principal
main "$@" 