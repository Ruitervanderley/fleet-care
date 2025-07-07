@echo off
chcp 65001 >nul
title Fleet Care - Gerador de Certificados SSL

echo.
echo ========================================
echo    GERADOR DE CERTIFICADOS SSL
echo ========================================
echo.
echo Este script irá gerar certificados SSL auto-assinados
echo para desenvolvimento local do Fleet Care.
echo.

:: Verificar se o OpenSSL está instalado
echo [1/4] Verificando OpenSSL...
openssl version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ OpenSSL não encontrado!
    echo.
    echo Por favor, instale o OpenSSL:
    echo.
    echo Opção 1 - Chocolatey:
    echo   choco install openssl
    echo.
    echo Opção 2 - Baixar manualmente:
    echo   https://slproweb.com/products/Win32OpenSSL.html
    echo.
    echo Após a instalação, reinicie o terminal e tente novamente.
    pause
    exit /b 1
) else (
    echo ✅ OpenSSL encontrado
)

:: Criar diretório SSL se não existir
echo.
echo [2/4] Criando estrutura de diretórios...
if not exist "ssl" mkdir ssl
echo ✅ Diretório SSL criado

:: Gerar chave privada
echo.
echo [3/4] Gerando chave privada...
openssl genrsa -out ssl\key.pem 2048
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar chave privada
    pause
    exit /b 1
) else (
    echo ✅ Chave privada gerada
)

:: Gerar certificado auto-assinado
echo.
echo [4/4] Gerando certificado auto-assinado...
openssl req -new -x509 -key ssl\key.pem -out ssl\cert.pem -days 365 -subj "/C=BR/ST=SP/L=Sao Paulo/O=Fleet Care/OU=Development/CN=localhost"
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar certificado
    pause
    exit /b 1
) else (
    echo ✅ Certificado gerado
)

:: Verificar certificado
echo.
echo Verificando certificado...
openssl x509 -in ssl\cert.pem -text -noout | findstr "Subject:"
openssl x509 -in ssl\cert.pem -text -noout | findstr "Not After"

:: Instalação concluída
echo.
echo ========================================
echo    CERTIFICADOS SSL GERADOS!
echo ========================================
echo.
echo Os certificados SSL foram gerados com sucesso:
echo.
echo 📁 Arquivos criados:
echo    ssl\cert.pem - Certificado público
echo    ssl\key.pem  - Chave privada
echo.
echo 🔒 Informações do certificado:
echo    Válido por: 365 dias
echo    Domínio: localhost
echo    País: BR
echo    Organização: Fleet Care
echo.
echo ⚠️  IMPORTANTE:
echo    - Este é um certificado auto-assinado
echo    - Seu navegador mostrará um aviso de segurança
echo    - Para desenvolvimento local, você pode aceitar o risco
echo    - Para produção, use certificados de uma CA confiável
echo.
echo 🚀 Para usar com Docker:
echo    docker-compose up -d
echo.
echo 🌐 Acesse: https://localhost
echo.
echo Pressione qualquer tecla para sair...
pause >nul 