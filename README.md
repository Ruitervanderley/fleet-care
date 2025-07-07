# 🚀 Fleet Care - Sistema de Gestão de Frotas

Sistema completo de gestão de frotas com dashboard moderno, monitoramento inteligente e gestão proativa de equipamentos.

## ✨ Características Principais

- **📊 Dashboard Interativo** - Visualização em tempo real do status da frota
- **🔧 Gestão de Manutenção** - Controle de intervalos e agendamentos
- **🚨 Alertas Inteligentes** - Notificações proativas de equipamentos críticos
- **📈 Análises Avançadas** - Métricas e relatórios detalhados
- **🎨 Interface Moderna** - Design responsivo e intuitivo
- **⚙️ Personalização** - Widgets configuráveis e temas
- **🔒 Segurança** - Autenticação e autorização robustas

## 🚀 Instalação Rápida

### Windows
```bash
# Instalação automatizada
install.bat

# Ou com Docker (recomendado)
install-docker.bat
```

### Linux/macOS
```bash
# Instalação automatizada
chmod +x install.sh
./install.sh

# Ou com Docker
docker-compose up --build -d
```

## 📋 Pré-requisitos

- **Python 3.8+** (para backend)
- **Node.js 16+** (para frontend)
- **Docker** (opcional, mas recomendado)

## 🎯 Métodos de Instalação

### 1. 🚀 Instalação Automatizada
- **Windows:** Execute `install.bat`
- **Linux/macOS:** Execute `./install.sh`
- Instala automaticamente todas as dependências
- Cria scripts de inicialização
- Configura ambiente de desenvolvimento

### 2. 🐳 Instalação com Docker
- **Windows:** Execute `install-docker.bat`
- **Linux/macOS:** `docker-compose up --build -d`
- Mais fácil e isolado
- Inclui Nginx, PostgreSQL e Redis
- Certificados SSL automáticos

### 3. 🔧 Instalação Manual
Consulte [INSTALACAO.md](INSTALACAO.md) para instruções detalhadas.

## 🌐 URLs de Acesso

Após a instalação:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Docker (HTTPS):** https://localhost

## 🛠️ Scripts de Inicialização

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
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar sistema
docker-compose down

# Reiniciar
docker-compose restart

# Atualizar
docker-compose pull && docker-compose up -d
```

## 🔒 Segurança

### Certificados SSL
Para desenvolvimento local com HTTPS:
```bash
# Windows
generate-ssl.bat

# Linux/macOS
chmod +x generate-ssl.sh
./generate-ssl.sh
```

## 📁 Estrutura do Projeto

```
fleet-care/
├── backend/                 # API Python/Flask
│   ├── app.py              # Aplicação principal
│   ├── requirements.txt    # Dependências Python
│   └── .env               # Configurações
├── frontend/               # Interface React
│   ├── src/               # Código fonte
│   ├── package.json       # Dependências Node.js
│   └── .env              # Configurações
├── install.bat            # Instalador Windows
├── install.sh             # Instalador Linux/macOS
├── install-docker.bat     # Instalador Docker Windows
├── docker-compose.yml     # Configuração Docker
├── nginx.conf            # Configuração Nginx
├── generate-ssl.bat      # Gerador SSL Windows
├── generate-ssl.sh       # Gerador SSL Linux/macOS
├── INSTALACAO.md         # Guia completo de instalação
└── README.md             # Este arquivo
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
FLASK_ENV=development
FLASK_APP=app.py
DATABASE_URL=sqlite:///fleet_care.db
SECRET_KEY=sua-chave-secreta-aqui
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=Fleet Care
```

## 📊 Funcionalidades

### Dashboard Principal
- **Resumo Executivo** - Métricas de alto nível
- **Alertas Prioritários** - Equipamentos críticos
- **Status da Frota** - Visão geral operacional
- **Ações Rápidas** - Acesso rápido às funcionalidades

### Gestão de Equipamentos
- Cadastro e edição de equipamentos
- Configuração de intervalos de manutenção
- Monitoramento de uso e status
- Histórico de manutenções

### Sistema de Alertas
- Alertas automáticos baseados em intervalos
- Notificações de equipamentos críticos
- Priorização de manutenções
- Relatórios de status

### Personalização
- Widgets configuráveis
- Temas claro/escuro
- Layout personalizável
- Dashboard adaptável

## 🔧 Desenvolvimento

### Backend (Python/Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python app.py
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

## 📈 Monitoramento

Endpoints de monitoramento disponíveis:
- **Health Check:** http://localhost:8000/health
- **Status API:** http://localhost:8000/status
- **Métricas:** http://localhost:8000/metrics

## 🔄 Atualizações

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

## 🐛 Solução de Problemas

### Problemas Comuns

1. **"Python não encontrado"**
   - Instale Python 3.8+ de https://www.python.org/downloads/
   - Marque "Add Python to PATH" durante a instalação

2. **"Node.js não encontrado"**
   - Instale Node.js 16+ de https://nodejs.org/

3. **"Docker não encontrado"**
   - Instale Docker Desktop de https://www.docker.com/products/docker-desktop/
   - Reinicie o computador após a instalação

4. **"Porta já em uso"**
   - Verifique se as portas 8000, 5173, 80, 443 estão livres
   - Use `netstat -an | findstr :8000` (Windows) ou `lsof -i :8000` (Linux/macOS)

### Logs e Debug
```bash
# Docker logs
docker-compose logs -f

# Backend logs
cd backend && python app.py

# Frontend logs
cd frontend && npm run dev
```

## 📞 Suporte

- **Documentação:** [INSTALACAO.md](INSTALACAO.md)
- **Issues:** GitHub Issues
- **Email:** suporte@fleetcare.com

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**🎉 Obrigado por usar o Fleet Care!**

import logoArruda from './assets/logo-arruda.png';

<div className="logo">
  <img src={logoArruda} alt="Arruda" style={{ height: 40, marginRight: 12, verticalAlign: 'middle' }} />
  Arruda Fleet Care
</div>

docker compose build frontend
docker compose up -d