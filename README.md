# Fleet Care - Sistema de Gestão de Manutenção

## 🚛 Visão Geral

O **Fleet Care** é um sistema completo e moderno para gestão de manutenção de frotas, desenvolvido com tecnologias de ponta e interface premium. O sistema oferece recursos avançados de monitoramento, análise preditiva, configuração inteligente de intervalos e geração de relatórios detalhados.

## ✨ Funcionalidades Principais

### 🎯 **Dashboard Inteligente**
- **Visão Geral da Frota** com métricas em tempo real
- **Resumo Executivo** com KPIs principais
- **Alertas Prioritários** com notificações inteligentes
- **Status da Frota** com indicadores visuais
- **Ações Rápidas** para acesso direto às funcionalidades
- **Personalização** completa de widgets e temas

### 🚗 **Gestão de Equipamentos**
- **Cadastro Inteligente** com detecção automática de tipos
- **Monitoramento em Tempo Real** de status e localização
- **Histórico Detalhado** de manutenções e serviços
- **Configuração Inteligente** de intervalos de manutenção
- **Detecção Automática** de KM/Horas por tipo de equipamento

### 🔧 **Sistema de Manutenção**
- **Agendamento Inteligente** com sugestões automáticas
- **Checklist Interativo** com controle de responsabilidades
- **Registro Detalhado** de serviços realizados
- **Controle de Custos** com orçamentos e valores reais
- **Status em Tempo Real** com badges visuais

### 📊 **Análise Preditiva**
- **Previsão de Falhas** baseada em histórico
- **Otimização de Custos** com recomendações
- **Tendências de Performance** com gráficos interativos
- **Alertas Preventivos** para manutenções necessárias

### 📋 **Relatórios Avançados**
- **Relatórios Personalizáveis** com filtros avançados
- **Exportação Multi-formato** (Excel, PDF, CSV)
- **Análises Detalhadas** por período e equipamento
- **Dashboards Executivos** com métricas de negócio

### ⚙️ **Configurações Inteligentes**
- **Importação Automática** de planilhas Excel
- **Configuração de Intervalos** com detecção inteligente
- **Personalização de Dashboard** com drag & drop
- **Temas Visuais** (Claro/Escuro/Automático)

## 🛠️ Tecnologias

### **Frontend**
- ⚛️ **React 18** - Interface moderna e responsiva
- ⚡ **Vite** - Build rápido e otimizado
- 🎨 **CSS Modules** - Estilos modulares e organizados
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **Lucide Icons** - Ícones vetoriais modernos
- 🌈 **Gradientes e Animações** - UI premium

### **Backend**
- 🐍 **Python 3.11+** - Lógica robusta e escalável
- ⚡ **FastAPI** - API REST moderna e rápida
- 🗄️ **SQLAlchemy** - ORM avançado
- 📊 **Pandas** - Processamento de dados
- 🔄 **APScheduler** - Tarefas agendadas

### **Infraestrutura**
- 🐳 **Docker & Docker Compose** - Containerização
- 🌐 **Nginx** - Proxy reverso e cache
- 🗄️ **PostgreSQL** - Banco de dados robusto
- 🔄 **Redis** - Cache e sessões
- 📁 **SMB Protocol** - Acesso a arquivos de rede

## 📁 Estrutura do Projeto

```
fleet-care/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── assets/          # Recursos estáticos
│   │   ├── components/      # Componentes React
│   │   ├── config/          # Configurações
│   │   ├── hooks/           # Hooks personalizados
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços API
│   │   └── styles/          # Sistema de design CSS
│   │       ├── _variables.css    # Variáveis CSS
│   │       ├── _base.css         # Estilos base
│   │       ├── _components.css   # Componentes
│   │       ├── _dashboard.css    # Dashboard
│   │       ├── _forms.css        # Formulários
│   │       ├── _buttons.css      # Botões
│   │       ├── _tables.css       # Tabelas
│   │       ├── _header.css       # Header
│   │       └── _modern.css       # Recursos modernos
│   └── package.json
├── backend/                  # API FastAPI
│   ├── app.py               # Aplicação principal
│   ├── advanced_importer.py # Importação avançada
│   ├── config_manager.py    # Gerenciador de configuração
│   ├── requirements.txt     # Dependências Python
│   └── data/               # Dados e arquivos
├── docker-compose.yml       # Orquestração Docker
├── nginx.conf              # Configuração Nginx
└── README.md               # Documentação
```

## 🚀 Instalação Rápida

### **1. Pré-requisitos**
```bash
# Node.js 18+ e Python 3.11+
# Docker e Docker Compose
```

### **2. Clone e Execute**
```bash
git clone https://github.com/seu-usuario/fleet-care.git
cd fleet-care
docker-compose up -d
```

### **3. Acesse o Sistema**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📊 **Documentação API**: http://localhost:8000/docs

## ⚙️ Configuração

### **Variáveis de Ambiente**
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost/fleetcare
REDIS_URL=redis://localhost:6379
API_KEY=your-secret-key

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Fleet Care
```

### **Importação de Dados**
1. Configure o caminho da planilha em `backend/config.json`
2. Acesse "Configurações" no sistema
3. Clique em "Importar Planilha"
4. O sistema detectará automaticamente os tipos de equipamentos

## 🎨 Características de Design

### **Interface Moderna**
- 🎨 **Design System** completo com variáveis CSS
- 🌈 **Gradientes Modernos** e animações suaves
- 📱 **Responsividade Total** para todos os dispositivos
- 🌙 **Dark/Light Theme** com transições suaves
- ⚡ **Performance Otimizada** com lazy loading

### **Experiência do Usuário**
- 🎯 **Navegação Intuitiva** com breadcrumbs
- 🔍 **Busca Global** em tempo real
- 📊 **Gráficos Interativos** com hover effects
- 🎨 **Feedback Visual** com toasts e animações
- ⚡ **Carregamento Rápido** com skeleton screens

## 🔧 Desenvolvimento

### **Padrões de Código**
- **Frontend**: Componentes funcionais com hooks, CSS Modules
- **Backend**: PEP 8, type hints, documentação automática
- **Git**: Conventional Commits (feat, fix, docs, etc.)

### **Scripts Úteis**
```bash
# Desenvolvimento
npm run dev          # Frontend em modo dev
python app.py        # Backend local

# Build e Deploy
docker-compose build # Build das imagens
docker-compose up -d # Deploy em produção
```

## 📊 Funcionalidades Avançadas

### **Configuração Inteligente**
- 🤖 **Detecção Automática** de tipos de equipamentos
- 📊 **Sugestões Inteligentes** de intervalos
- 🔄 **Configuração em Lote** por categoria
- 📈 **Otimização Baseada** em histórico

### **Dashboard Personalizável**
- 🎛️ **Widgets Configuráveis** com drag & drop
- 🎨 **Temas Personalizáveis** (Claro/Escuro/Auto)
- 📱 **Layout Responsivo** que se adapta
- ⚡ **Atualizações em Tempo Real**

### **Sistema de Notificações**
- 🔔 **Alertas Prioritários** com cores
- 📧 **Notificações por Email** automáticas
- 📱 **Push Notifications** (futuro)
- ⏰ **Lembretes Inteligentes**

## 🚀 Roadmap

### **Próximas Funcionalidades**
- [ ] 🔐 **Autenticação JWT** com roles
- [ ] 📱 **App Mobile** para técnicos
- [ ] 🔗 **Integração IoT** com sensores
- [ ] 📦 **Gestão de Peças** e estoque
- [ ] 🤝 **Integração com Fornecedores**
- [ ] 📊 **Relatórios Avançados** com BI
- [ ] 🗺️ **Geolocalização** em tempo real

### **Melhorias Técnicas**
- [ ] ⚡ **PWA** (Progressive Web App)
- [ ] 🔄 **Offline Mode** com cache
- [ ] 📈 **Analytics** e métricas de uso
- [ ] 🔒 **Auditoria** completa de ações
- [ ] 🌐 **Multi-idioma** (i18n)

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. **Commit** suas mudanças (`git commit -m 'feat: Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/NovaFuncionalidade`)
5. **Abra** um Pull Request

### **Padrões de Commit**
```bash
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação
refactor: Refatoração
test: Testes
chore: Manutenção
```

## 📞 Suporte

- 📧 **Email**: support@fleetcare.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/fleet-care/issues)
- 📖 **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/fleet-care/wiki)

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## 👥 Autores

- **Desenvolvedor Principal** - [Seu Nome](https://github.com/seunome)
- **Design System** - [Designer](https://github.com/designer)
- **DevOps** - [DevOps Engineer](https://github.com/devops)

## 🙏 Agradecimentos

- 🏢 **Arruda Transporte** - Cliente e parceiro
- 👥 **Equipe de Desenvolvimento** - Dedicação e qualidade
- 🧪 **Beta Testers** - Feedback valioso
- 🌟 **Comunidade Open Source** - Inspiração e ferramentas

---

**Fleet Care** - Transformando a gestão de frotas com tecnologia moderna e design premium! 🚛✨