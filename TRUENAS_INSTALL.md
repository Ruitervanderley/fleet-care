# 🚀 **Instalação do Fleet Care no TrueNAS**

## 📋 **Pré-requisitos**

### **1. TrueNAS SCALE (Recomendado)**
- ✅ TrueNAS SCALE 22.12 ou superior
- ✅ Docker habilitado
- ✅ Acesso SSH habilitado

### **2. TrueNAS CORE**
- ✅ TrueNAS CORE 13.0 ou superior
- ✅ Jail com Docker habilitado
- ✅ Acesso SSH habilitado

---

## 🛠️ **Método 1: Instalação Automática (Recomendado)**

### **Passo 1: Preparar o TrueNAS**
```bash
# Conectar via SSH
ssh root@seu-truenas-ip

# Criar diretório para aplicações
mkdir -p /mnt/tank/apps
cd /mnt/tank/apps
```

### **Passo 2: Baixar o Sistema**
```bash
# Clonar o repositório (se usar Git)
git clone https://github.com/seu-usuario/fleet-care.git
cd fleet-care

# OU baixar e extrair o arquivo ZIP
wget https://github.com/seu-usuario/fleet-care/archive/main.zip
unzip main.zip
cd fleet-care-main
```

### **Passo 3: Instalar Automaticamente**
```bash
# Dar permissão de execução
chmod +x update-system.sh

# Executar instalação automática
./update-system.sh
# Escolha opção [7] - Instalar no TrueNAS
```

---

## 🛠️ **Método 2: Instalação Manual**

### **Passo 1: Configurar Docker**
```bash
# Verificar se Docker está instalado
docker --version

# Se não estiver instalado (TrueNAS CORE)
pkg install docker
sysrc docker_enable="YES"
service docker start
```

### **Passo 2: Configurar Docker Compose**
```bash
# Instalar Docker Compose
pip install docker-compose

# OU usar versão standalone
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### **Passo 3: Configurar o Sistema**
```bash
# Criar diretório de instalação
mkdir -p /opt/fleet-care
cd /opt/fleet-care

# Copiar arquivos do sistema
cp -r /caminho/para/fleet-care/* .

# Configurar permissões
chmod +x update-system.sh
```

### **Passo 4: Configurar Variáveis de Ambiente**
```bash
# Criar arquivo .env
cat > .env << EOF
# Configurações do Backend
BACKEND_PORT=8000
DATABASE_URL=sqlite:///app/data/fleet_care.db

# Configurações do Frontend
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8000

# Configurações de Rede
NETWORK_SHARE_PATH=//servidor/ARRUDA GERAL/Arruda Transporte de Lenha/APONTAMENTOS/PRODUÇÃO E EFICIÊNCIA
NETWORK_USERNAME=seu_usuario
NETWORK_PASSWORD=sua_senha

# Configurações de SSL (opcional)
SSL_CERT_PATH=/etc/ssl/certs/fleet-care.crt
SSL_KEY_PATH=/etc/ssl/private/fleet-care.key
EOF
```

### **Passo 5: Iniciar o Sistema**
```bash
# Construir e iniciar containers
docker-compose up -d

# Verificar status
docker-compose ps

# Verificar logs
docker-compose logs -f
```

---

## 🔧 **Configuração Avançada**

### **1. Configurar Proxy Reverso (Nginx)**
```bash
# Instalar Nginx
pkg install nginx

# Configurar proxy reverso
cat > /usr/local/etc/nginx/nginx.conf << EOF
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
        server_name seu-dominio.com;
        
        location /api/ {
            proxy_pass http://fleet_care_backend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        
        location / {
            proxy_pass http://fleet_care_frontend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF

# Iniciar Nginx
sysrc nginx_enable="YES"
service nginx start
```

### **2. Configurar SSL (Let's Encrypt)**
```bash
# Instalar certbot
pkg install py39-certbot

# Obter certificado
certbot --nginx -d seu-dominio.com

# Configurar renovação automática
echo "0 12 * * * /usr/local/bin/certbot renew --quiet" | crontab -
```

### **3. Configurar Backup Automático**
```bash
# Criar script de backup
cat > /opt/fleet-care/backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/mnt/tank/backups/fleet-care"
DATE=\$(date +"%Y-%m-%d_%H-%M-%S")

mkdir -p \$BACKUP_DIR

# Backup dos dados
docker-compose exec -T backend tar czf - /app/data > \$BACKUP_DIR/data_\$DATE.tar.gz

# Backup das configurações
tar czf \$BACKUP_DIR/config_\$DATE.tar.gz *.yml *.json *.md

# Limpar backups antigos (manter últimos 7 dias)
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/fleet-care/backup.sh

# Adicionar ao cron
echo "0 2 * * * /opt/fleet-care/backup.sh" | crontab -
```

---

## 📊 **Monitoramento e Manutenção**

### **1. Verificar Status do Sistema**
```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Uso de recursos
docker stats
```

### **2. Atualizações Automáticas**
```bash
# Criar script de atualização automática
cat > /opt/fleet-care/auto-update.sh << EOF
#!/bin/bash
cd /opt/fleet-care

# Fazer backup antes da atualização
./backup.sh

# Atualizar sistema
git pull origin main
docker-compose pull
docker-compose build --no-cache
docker-compose up -d

# Limpar imagens antigas
docker image prune -f
EOF

chmod +x /opt/fleet-care/auto-update.sh

# Agendar atualização semanal
echo "0 3 * * 0 /opt/fleet-care/auto-update.sh" | crontab -
```

### **3. Monitoramento de Recursos**
```bash
# Instalar htop para monitoramento
pkg install htop

# Verificar uso de disco
df -h

# Verificar uso de memória
free -h

# Verificar processos
htop
```

---

## 🔒 **Segurança**

### **1. Firewall**
```bash
# Configurar firewall (pf)
cat > /etc/pf.conf << EOF
# Regras do firewall
ext_if = "em0"

# Permitir acesso SSH
pass in on \$ext_if proto tcp to port 22

# Permitir acesso HTTP/HTTPS
pass in on \$ext_if proto tcp to port 80
pass in on \$ext_if proto tcp to port 443

# Permitir acesso ao Fleet Care
pass in on \$ext_if proto tcp to port 3000
pass in on \$ext_if proto tcp to port 8000

# Bloquear todo o resto
block all
EOF

# Habilitar firewall
sysrc pf_enable="YES"
service pf start
```

### **2. Atualizações de Segurança**
```bash
# Atualizar sistema
pkg update
pkg upgrade

# Verificar vulnerabilidades
pkg audit -F

# Atualizar Docker
pkg install docker
```

---

## 🚨 **Troubleshooting**

### **Problema: Containers não iniciam**
```bash
# Verificar logs
docker-compose logs

# Verificar espaço em disco
df -h

# Verificar memória
free -h

# Reiniciar Docker
service docker restart
```

### **Problema: Acesso negado à rede**
```bash
# Verificar conectividade
ping servidor-rede

# Testar acesso SMB
smbclient -L //servidor -U usuario

# Verificar configurações de rede
cat /etc/smb.conf
```

### **Problema: Performance lenta**
```bash
# Verificar uso de CPU
top

# Verificar uso de memória
htop

# Verificar I/O
iostat

# Otimizar Docker
docker system prune -f
```

---

## 📞 **Suporte**

### **Logs Importantes**
```bash
# Logs do sistema
tail -f /var/log/messages

# Logs do Docker
docker-compose logs -f

# Logs do Nginx
tail -f /var/log/nginx/access.log
```

### **Comandos Úteis**
```bash
# Reiniciar sistema
docker-compose restart

# Parar sistema
docker-compose down

# Verificar status
docker-compose ps

# Backup manual
./backup.sh

# Atualização manual
./update-system.sh
```

---

## ✅ **Verificação Final**

Após a instalação, verifique:

1. ✅ **Acesso ao sistema**: `http://seu-truenas-ip:3000`
2. ✅ **API funcionando**: `http://seu-truenas-ip:8000/dashboard`
3. ✅ **Containers rodando**: `docker-compose ps`
4. ✅ **Logs sem erro**: `docker-compose logs`
5. ✅ **Backup funcionando**: `./backup.sh`
6. ✅ **Atualizações automáticas**: Configuradas no cron

---

## 🎉 **Sistema Instalado com Sucesso!**

O Fleet Care está agora instalado e configurado no seu TrueNAS. 

**Acesse**: `http://seu-truenas-ip:3000`

**Para atualizações futuras**: Use `./update-system.sh` 