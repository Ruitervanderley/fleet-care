#!/usr/bin/env python3
"""
Script de teste para os endpoints de intervalos
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_interval_endpoints():
    """Testa os endpoints de intervalos"""
    
    print("🧪 Testando endpoints de intervalos...")
    
    # 1. Listar equipamentos
    print("\n1. Listando equipamentos...")
    try:
        response = requests.get(f"{BASE_URL}/equipment")
        if response.status_code == 200:
            equipment = response.json()
            print(f"✅ Encontrados {len(equipment)} equipamentos")
            
            # Pegar o primeiro equipamento para teste
            if equipment:
                test_equipment = equipment[0]
                test_tag = test_equipment['tag']
                print(f"📋 Usando equipamento: {test_tag}")
                
                # 2. Configurar intervalo
                print(f"\n2. Configurando intervalo para {test_tag}...")
                response = requests.post(
                    f"{BASE_URL}/equipment/{test_tag}/interval",
                    params={"intervalo": 250}
                )
                if response.status_code == 200:
                    print("✅ Intervalo configurado com sucesso")
                else:
                    print(f"❌ Erro ao configurar intervalo: {response.text}")
                
                # 3. Editar intervalo
                print(f"\n3. Editando intervalo para {test_tag}...")
                response = requests.put(
                    f"{BASE_URL}/equipment/{test_tag}/interval",
                    params={"intervalo": 300}
                )
                if response.status_code == 200:
                    print("✅ Intervalo editado com sucesso")
                else:
                    print(f"❌ Erro ao editar intervalo: {response.text}")
                
                # 4. Verificar se foi atualizado
                print(f"\n4. Verificando intervalo atualizado...")
                response = requests.get(f"{BASE_URL}/equipment")
                if response.status_code == 200:
                    equipment_updated = response.json()
                    updated_eq = next((eq for eq in equipment_updated if eq['tag'] == test_tag), None)
                    if updated_eq and updated_eq['intervalo'] == 300:
                        print("✅ Intervalo atualizado corretamente")
                    else:
                        print("❌ Intervalo não foi atualizado corretamente")
                
                # 5. Remover intervalo
                print(f"\n5. Removendo intervalo para {test_tag}...")
                response = requests.delete(f"{BASE_URL}/equipment/{test_tag}/interval")
                if response.status_code == 200:
                    print("✅ Intervalo removido com sucesso")
                else:
                    print(f"❌ Erro ao remover intervalo: {response.text}")
                
                # 6. Verificar se foi removido
                print(f"\n6. Verificando remoção do intervalo...")
                response = requests.get(f"{BASE_URL}/equipment")
                if response.status_code == 200:
                    equipment_final = response.json()
                    final_eq = next((eq for eq in equipment_final if eq['tag'] == test_tag), None)
                    if final_eq and final_eq['intervalo'] == 0:
                        print("✅ Intervalo removido corretamente")
                    else:
                        print("❌ Intervalo não foi removido corretamente")
                
            else:
                print("❌ Nenhum equipamento encontrado para teste")
        else:
            print(f"❌ Erro ao listar equipamentos: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao backend. Certifique-se de que está rodando em http://localhost:8000")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_interval_endpoints() 