#!/usr/bin/env python3
"""
Script de teste para as funcionalidades de configuração
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_config_endpoints():
    """Testa os endpoints de configuração"""
    
    print("🧪 Testando endpoints de configuração...")
    
    # 1. Testar configuração padrão
    print("\n1. Carregando configuração padrão...")
    try:
        response = requests.get(f"{BASE_URL}/api/config")
        if response.status_code == 200:
            config = response.json()
            print("✅ Configuração carregada com sucesso")
            print(f"   Tipo: {config.get('importType', 'N/A')}")
            print(f"   Caminho: {config.get('filePath', 'N/A')}")
            print(f"   Auto Import: {config.get('autoImport', 'N/A')}")
            print(f"   Horário: {config.get('importHour', 'N/A')}:{config.get('importMinute', 'N/A')}")
        else:
            print(f"❌ Erro ao carregar configuração: {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao backend. Certifique-se de que está rodando em http://localhost:8000")
        return
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return
    
    # 2. Salvar nova configuração
    print("\n2. Salvando nova configuração...")
    new_config = {
        "importType": "local",
        "filePath": "C:\\teste\\planilha.xlsx",
        "username": "",
        "password": "",
        "autoImport": True,
        "importHour": "14",
        "importMinute": "30",
        "enabled": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/config", json=new_config)
        if response.status_code == 200:
            print("✅ Configuração salva com sucesso")
        else:
            print(f"❌ Erro ao salvar configuração: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao salvar configuração: {e}")
    
    # 3. Testar conexão (deve falhar pois o arquivo não existe)
    print("\n3. Testando conexão...")
    try:
        response = requests.post(f"{BASE_URL}/api/config/test", json=new_config)
        if response.status_code == 200:
            print("✅ Conexão testada com sucesso")
        else:
            print(f"❌ Erro ao testar conexão: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao testar conexão: {e}")
    
    # 4. Verificar configuração atualizada
    print("\n4. Verificando configuração atualizada...")
    try:
        response = requests.get(f"{BASE_URL}/api/config")
        if response.status_code == 200:
            config = response.json()
            if config.get('importHour') == '14' and config.get('importMinute') == '30':
                print("✅ Configuração atualizada corretamente")
            else:
                print("❌ Configuração não foi atualizada corretamente")
        else:
            print(f"❌ Erro ao carregar configuração: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao verificar configuração: {e}")
    
    # 5. Testar configuração de rede
    print("\n5. Testando configuração de rede...")
    network_config = {
        "importType": "network",
        "filePath": "\\\\servidor\\compartilhamento\\planilha.xlsx",
        "username": "usuario",
        "password": "senha123",
        "autoImport": True,
        "importHour": "09",
        "importMinute": "00",
        "enabled": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/config/test", json=network_config)
        if response.status_code == 200:
            print("✅ Conexão de rede testada com sucesso")
        else:
            print(f"❌ Erro ao testar conexão de rede: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao testar conexão de rede: {e}")

if __name__ == "__main__":
    test_config_endpoints() 