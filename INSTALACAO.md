# 🚀 Fleet Care - Guia de Instalação

Este guia apresenta diferentes métodos para instalar o sistema Fleet Care em seu computador.

## 📋 Pré-requisitos

### Requisitos Mínimos
- **Sistema Operacional:** Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **RAM:** 4GB mínimo (8GB recomendado)
- **Espaço em Disco:** 2GB livres
- **Processador:** Dual-core 2.0GHz+

### Software Necessário
- **Python 3.8+** (para backend)
- **Node.js 16+** (para frontend)
- **Git** (para clonar o repositório)

## 🎯 Métodos de Instalação

### 1. 🚀 Instalação Automatizada (Recomendado)

#### Windows
```bash
# Execute o instalador automatizado
install.bat
```

#### Linux/macOS
```bash
# Torne o script executável
chmod +x install.sh

# Execute o instalador
./install.sh
```

### 2. 🐳 Instalação com Docker (Mais Fácil)

#### Windows
```bash
# Execute o instalador Docker
install-docker.bat
```

#### Linux/macOS
```bash
# Instale o Docker primeiro
curl -fsSL https://get.docker.com | sh

# Execute com Docker Compose
docker-compose up --build -d
```

### 3. 🔧 Instalação Manual

#### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/fleet-care.git
cd fleet-care
```

#### Passo 2: Configurar Backend
```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env conforme necessário
```

#### Passo 3: Configurar Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

#### Passo 4: Iniciar o Sistema
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 URLs de Acesso

Após a instalação, o sistema estará disponível em:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Docker (com Nginx):** http://localhost

## 📁 Estrutura de Arquivos

```
fleet-care/
├── backend/                 # API Python/Flask
│   ├── app.py              # Aplicação principal
│   ├── requirements.txt    # Dependências Python
│   └── .env               # Configurações (criado automaticamente)
├── frontend/               # Interface React
│   ├── src/               # Código fonte
│   ├── package.json       # Dependências Node.js
│   └── .env              # Configurações (criado automaticamente)
├── install.bat            # Instalador Windows
├── install.sh             # Instalador Linux/macOS
├── install-docker.bat     # Instalador Docker Windows
├── docker-compose.yml     # Configuração Docker
├── nginx.conf            # Configuração Nginx
└── README.md             # Documentação principal
```

## ⚙️ Configurações

### Variáveis de Ambiente (Backend)
```env
# backend/.env
FLASK_ENV=development
FLASK_APP=app.py
DATABASE_URL=sqlite:///fleet_care.db
SECRET_KEY=sua-chave-secreta-aqui
```

### Variáveis de Ambiente (Frontend)
```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=Fleet Care
```

## 🚀 Scripts de Inicialização

Após a instalação, você terá acesso aos seguintes scripts:

### Windows
- `start-fleet-care.bat` - Inicia todo o sistema
- `start-backend.bat` - Inicia apenas o backend
- `start-frontend.bat` - Inicia apenas o frontend

### Linux/macOS
- `./start-fleet-care.sh` - Inicia todo o sistema
- `./start-backend.sh` - Inicia apenas o backend
- `./start-frontend.sh` - Inicia apenas o frontend

## 🐳 Comandos Docker Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Parar o sistema
docker-compose down

# Reiniciar o sistema
docker-compose restart

# Atualizar e reiniciar
docker-compose pull && docker-compose up -d

# Acessar container do backend
docker-compose exec backend bash

# Acessar container do frontend
docker-compose exec frontend bash
```

## 🔧 Solução de Problemas

### Erro: "Python não encontrado"
- Instale o Python 3.8+ de https://www.python.org/downloads/
- Certifique-se de marcar "Add Python to PATH" durante a instalação

### Erro: "Node.js não encontrado"
- Instale o Node.js 16+ de https://nodejs.org/

### Erro: "Docker não encontrado"
- Instale o Docker Desktop de https://www.docker.com/products/docker-desktop/
- Reinicie o computador após a instalação

### Erro: "Porta já em uso"
- Verifique se as portas 8000, 5173, 80, 443 estão livres
- Use `netstat -an | findstr :8000` (Windows) ou `lsof -i :8000` (Linux/macOS)

### Erro: "Permissão negada"
- Execute como administrador (Windows)
- Use `sudo` (Linux/macOS)

### Erro: "Módulo não encontrado"
- Reinstale as dependências: `pip install -r requirements.txt` (backend) ou `npm install` (frontend)

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. **Verifique os logs:** Use `docker-compose logs` ou verifique os terminais
2. **Consulte a documentação:** Leia o README.md principal
3. **Abra uma issue:** Reporte problemas no GitHub
4. **Entre em contato:** Envie email para suporte@fleetcare.com

## 🔄 Atualizações

Para atualizar o sistema:

### Instalação Manual
```bash
git pull origin main
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

### Docker
```bash
docker-compose pull
docker-compose up -d --build
```

## 📊 Monitoramento

O sistema inclui endpoints de monitoramento:

- **Health Check:** http://localhost:8000/health
- **Status API:** http://localhost:8000/status
- **Métricas:** http://localhost:8000/metrics

---

**🎉 Parabéns!** Seu sistema Fleet Care está pronto para uso! 