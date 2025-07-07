#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "    GERADOR DE CERTIFICADOS SSL"
echo "========================================"
echo -e "${NC}"
echo "Este script irá gerar certificados SSL auto-assinados"
echo "para desenvolvimento local do Fleet Care."
echo ""

# Verificar se o OpenSSL está instalado
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ OpenSSL não encontrado!${NC}"
    echo ""
    echo "Por favor, instale o OpenSSL:"
    echo "Ubuntu/Debian: sudo apt install openssl"
    echo "CentOS/RHEL: sudo yum install openssl"
    echo "macOS: brew install openssl"
    exit 1
fi

# Criar diretório SSL se não existir
if [ ! -d "ssl" ]; then
    mkdir ssl
    echo -e "${GREEN}✅ Diretório SSL criado${NC}"
fi

# Gerar chave privada
echo ""
echo -e "${BLUE}[1/3] Gerando chave privada...${NC}"
openssl genrsa -out ssl/key.pem 2048

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Chave privada gerada${NC}"
else
    echo -e "${RED}❌ Erro ao gerar chave privada${NC}"
    exit 1
fi

# Gerar certificado auto-assinado
echo ""
echo -e "${BLUE}[2/3] Gerando certificado auto-assinado...${NC}"
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=BR/ST=SP/L=Sao Paulo/O=Fleet Care/OU=Development/CN=localhost"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado gerado${NC}"
else
    echo -e "${RED}❌ Erro ao gerar certificado${NC}"
    exit 1
fi

# Verificar certificado
echo ""
echo -e "${BLUE}[3/3] Verificando certificado...${NC}"
openssl x509 -in ssl/cert.pem -text -noout | grep -E "(Subject:|Not After)"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado verificado${NC}"
else
    echo -e "${RED}❌ Erro ao verificar certificado${NC}"
    exit 1
fi

# Configurar permissões
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo ""
echo -e "${BLUE}========================================"
echo "    CERTIFICADOS SSL GERADOS!"
echo "========================================"
echo -e "${NC}"
echo "Os certificados SSL foram gerados com sucesso:"
echo ""
echo "📁 Arquivos criados:"
echo "   ssl/cert.pem - Certificado público"
echo "   ssl/key.pem  - Chave privada"
echo ""
echo "🔒 Informações do certificado:"
echo "   Válido por: 365 dias"
echo "   Domínio: localhost"
echo "   País: BR"
echo "   Organização: Fleet Care"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Este é um certificado auto-assinado"
echo "   - Seu navegador mostrará um aviso de segurança"
echo "   - Para desenvolvimento local, você pode aceitar o risco"
echo "   - Para produção, use certificados de uma CA confiável"
echo ""
echo "🚀 Para usar com Docker:"
echo "   docker-compose up -d"
echo ""
echo "🌐 Acesse: https://localhost"
echo ""
read -p "Pressione Enter para sair..." 

docker-compose restart frontend 