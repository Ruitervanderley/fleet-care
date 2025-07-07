# Configuração das Variáveis de Ambiente

## Setup Inicial

1. Copie o arquivo de exemplo:
   ```bash
   copy env.example .env
   ```

2. Edite o arquivo `.env` conforme necessário

## Variáveis de Ambiente

### Obrigatórias

- `CAMINHO_PLANILHA`: Caminho completo para a planilha Excel (use \\ ou / no Windows)

### Opcionais

- `HORA_IMPORT`: Horário para importação automática diária (padrão: "10:05")
- `TZ`: Fuso horário para o agendador (padrão: "America/Sao_Paulo")

## Exemplo de arquivo .env

```
# caminho COMPLETO da planilha (use \\ ou /)
CAMINHO_PLANILHA=C:\\Users\\Usuario\\OneDrive\\Área de Trabalho\\MANUTENCAO ARRUDA\\PRODUTIVIDADE EQUIPAMENTOS.xlsx

# horário (HH:MM) em que o job automático roda (America/Sao_Paulo)
HORA_IMPORT=10:05

# fuso
TZ=America/Sao_Paulo
```

## Docker

Para executar com Docker:

```bash
docker build -t fleet-care-backend .
docker run -p 8000:8000 --env-file .env fleet-care-backend
``` 