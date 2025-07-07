# 🚀 Fleet Care - Setup Rápido

## ⚡ Instalação em 1 Minuto

### Windows
```bash
# Opção 1: Instalação completa
install.bat

# Opção 2: Docker (mais fácil)
install-docker.bat
```

### Linux/macOS
```bash
# Opção 1: Instalação completa
chmod +x install.sh && ./install.sh

# Opção 2: Docker
docker-compose up --build -d
```

## 🎯 Qual Método Escolher?

### 🐳 Docker (Recomendado)
- ✅ **Mais fácil** - Um comando só
- ✅ **Isolado** - Não afeta seu sistema
- ✅ **Completo** - Inclui banco de dados e proxy
- ✅ **HTTPS** - Certificados SSL automáticos
- ❌ **Requer Docker** - Precisa instalar Docker Desktop

### 🔧 Instalação Manual
- ✅ **Controle total** - Você controla tudo
- ✅ **Sem Docker** - Não precisa instalar Docker
- ✅ **Desenvolvimento** - Ideal para desenvolvedores
- ❌ **Mais complexo** - Múltiplos passos
- ❌ **Dependências** - Precisa Python e Node.js

## 🚀 Iniciar o Sistema

### Após Instalação Manual
```bash
# Iniciar tudo
start-fleet-care.bat    # Windows
./start-fleet-care.sh   # Linux/macOS

# Ou separadamente
start-backend.bat       # Backend (porta 8000)
start-frontend.bat      # Frontend (porta 5173)
```

### Após Instalação Docker
```bash
# Sistema já está rodando!
# Acesse: http://localhost:5173
```

## 🌐 URLs de Acesso

| Método | Frontend | Backend | HTTPS |
|--------|----------|---------|-------|
| Manual | http://localhost:5173 | http://localhost:8000 | ❌ |
| Docker | http://localhost:5173 | http://localhost:8000 | ✅ https://localhost |

## 🔧 Comandos Úteis

### Docker
```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart
```

### Manual
```bash
# Backend
cd backend && python app.py

# Frontend
cd frontend && npm run dev
```

## 🆘 Problemas Comuns

### "Python não encontrado"
- Instale Python 3.8+ de https://www.python.org/downloads/
- Marque "Add Python to PATH"

### "Node.js não encontrado"
- Instale Node.js 16+ de https://nodejs.org/

### "Docker não encontrado"
- Instale Docker Desktop de https://www.docker.com/products/docker-desktop/
- Reinicie o computador

### "Porta já em uso"
- Verifique se as portas 8000, 5173 estão livres
- Use `netstat -an | findstr :8000` (Windows) ou `lsof -i :8000` (Linux/macOS)

## 📞 Ajuda

- **Documentação completa:** [INSTALACAO.md](INSTALACAO.md)
- **README principal:** [README.md](README.md)
- **Issues:** GitHub Issues
- **Email:** suporte@fleetcare.com

---

**🎉 Pronto! Seu Fleet Care está funcionando!** 