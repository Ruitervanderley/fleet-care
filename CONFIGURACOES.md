# Sistema de Configurações - Fleet Care

## Visão Geral

O sistema de configurações permite gerenciar de forma centralizada todas as configurações de importação de dados, incluindo:

- **Origem dos dados**: Arquivo local, rede, S3, FTP
- **Credenciais de acesso**: Usuário e senha para fontes protegidas
- **Importação automática**: Horário e frequência de importação
- **Status do sistema**: Ativar/desativar importações

## Funcionalidades

### 1. Tipos de Origem Suportados

#### Arquivo Local
- **Descrição**: Arquivo Excel localizado no servidor
- **Formato**: `C:\Caminho\Para\planilha.xlsx`
- **Credenciais**: Não necessárias
- **Uso**: Ideal para arquivos locais no servidor

#### Rede/Compartilhamento
- **Descrição**: Arquivo em compartilhamento de rede Windows
- **Formato**: `\\servidor\compartilhamento\planilha.xlsx`
- **Credenciais**: Usuário e senha da rede
- **Uso**: Para arquivos em servidores de rede

#### Amazon S3
- **Descrição**: Arquivo armazenado no Amazon S3
- **Formato**: `s3://bucket-name/path/to/planilha.xlsx`
- **Credenciais**: Access Key ID e Secret Access Key
- **Uso**: Para arquivos na nuvem AWS

#### FTP/SFTP
- **Descrição**: Arquivo em servidor FTP ou SFTP
- **Formato**: `ftp://servidor.com/planilha.xlsx` ou `sftp://servidor.com/planilha.xlsx`
- **Credenciais**: Usuário e senha do FTP
- **Uso**: Para arquivos em servidores FTP

### 2. Configurações de Importação

#### Importação Automática
- **Ativar/Desativar**: Controla se a importação automática está ativa
- **Horário**: Define o horário diário para importação (HH:MM)
- **Frequência**: Diária (configurável para outras frequências futuras)

#### Status do Sistema
- **Sistema Ativo**: Controla se todas as importações estão habilitadas
- **Pausa Global**: Desativa todas as importações quando necessário

### 3. Segurança

#### Criptografia de Senhas
- Todas as senhas são criptografadas usando Fernet (AES-128)
- Chave de criptografia armazenada em arquivo separado (`config.key`)
- Senhas descriptografadas apenas em memória durante uso

#### Validação de Acesso
- Teste de conexão antes de salvar configurações
- Verificação de permissões de acesso aos arquivos
- Logs detalhados de tentativas de acesso

## Como Usar

### 1. Acessar Configurações
1. No menu principal, clique em "Configurações"
2. Clique em "Configurar Importação"
3. O modal de configurações será aberto

### 2. Configurar Origem
1. Selecione o tipo de origem (Local, Rede, S3, FTP)
2. Digite o caminho/URL do arquivo
3. Se necessário, informe usuário e senha
4. Clique em "Testar Conexão" para verificar acesso

### 3. Configurar Importação Automática
1. Marque "Ativar importação automática"
2. Selecione o horário desejado (hora e minuto)
3. Marque "Sistema ativo" para habilitar

### 4. Salvar Configurações
1. Clique em "Salvar Configurações"
2. O sistema aplicará as configurações automaticamente
3. A importação automática será agendada no horário configurado

### 5. Testar e Importar
- **Testar Conexão**: Verifica se o arquivo está acessível
- **Importar Agora**: Executa uma importação manual com as configurações atuais

## Arquivos de Configuração

### config.json
```json
{
  "importType": "local",
  "filePath": "C:\\Dados\\planilha.xlsx",
  "username": "",
  "password": "",
  "autoImport": true,
  "importHour": "10",
  "importMinute": "05",
  "enabled": true
}
```

### config.key
- Arquivo binário contendo a chave de criptografia
- Gerado automaticamente na primeira execução
- **IMPORTANTE**: Não compartilhar ou perder este arquivo

## Endpoints da API

### GET /api/config
- **Descrição**: Obtém configurações atuais
- **Resposta**: JSON com todas as configurações

### POST /api/config
- **Descrição**: Salva novas configurações
- **Body**: JSON com configurações
- **Resposta**: Confirmação de salvamento

### POST /api/config/test
- **Descrição**: Testa conexão com origem configurada
- **Body**: JSON com configurações para teste
- **Resposta**: Resultado do teste de conexão

### POST /api/config/import
- **Descrição**: Executa importação manual
- **Body**: JSON com configurações
- **Resposta**: Resultado da importação

## Logs e Monitoramento

### Logs de Configuração
- Salvamento de configurações
- Testes de conexão
- Erros de acesso
- Mudanças de agendamento

### Monitoramento
- Status da importação automática
- Última importação realizada
- Próxima importação agendada
- Erros de conexão

## Troubleshooting

### Problemas Comuns

#### Arquivo não encontrado
- Verificar se o caminho está correto
- Testar acesso manual ao arquivo
- Verificar permissões de leitura

#### Erro de credenciais
- Verificar usuário e senha
- Testar login manual
- Verificar se a conta tem permissões

#### Importação não executa
- Verificar se "Sistema ativo" está marcado
- Verificar se "Importação automática" está ativa
- Verificar logs do agendador

#### Erro de criptografia
- Verificar se o arquivo `config.key` existe
- Não compartilhar o arquivo de chave
- Em caso de perda, deletar `config.json` para recriar

### Comandos Úteis

#### Verificar configurações
```bash
curl http://localhost:8000/api/config
```

#### Testar conexão
```bash
curl -X POST http://localhost:8000/api/config/test \
  -H "Content-Type: application/json" \
  -d '{"importType":"local","filePath":"/path/to/file.xlsx"}'
```

#### Importar manualmente
```bash
curl -X POST http://localhost:8000/api/config/import \
  -H "Content-Type: application/json" \
  -d '{"importType":"local","filePath":"/path/to/file.xlsx"}'
```

## Próximas Funcionalidades

- [ ] Suporte a múltiplas origens
- [ ] Importação em intervalos personalizados (não apenas diário)
- [ ] Backup automático de configurações
- [ ] Interface para visualizar logs
- [ ] Notificações de falha de importação
- [ ] Suporte a outros formatos de arquivo
- [ ] Integração com sistemas de monitoramento 