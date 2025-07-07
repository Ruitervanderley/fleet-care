@echo off
echo ========================================
echo Testando Sistema de Manutencoes
echo ========================================
echo.

echo 1. Testando API de Fornecedores...
curl -X POST http://localhost:8000/suppliers -H "Content-Type: application/json" -d "{\"nome\":\"Oficina Teste\",\"cnpj\":\"12.345.678/0001-90\",\"telefone\":\"(11) 99999-9999\",\"email\":\"contato@oficinateste.com\",\"endereco\":\"Rua Teste, 123\",\"especialidade\":\"Mecanica\"}"
echo.
echo.

echo 2. Testando API de Manutencoes...
curl -X POST http://localhost:8000/maintenance -H "Content-Type: application/json" -d "{\"tag\":\"EXCAVADORA-001\",\"tipo_manutencao\":\"PREVENTIVA\",\"data_agendada\":\"2024-01-15\",\"fornecedor_id\":1,\"valor_orcado\":1500.00,\"observacoes\":\"Manutencao preventiva programada\",\"duracao_estimada\":120,\"local\":\"Oficina\",\"responsavel\":\"Joao Silva\"}"
echo.
echo.

echo 3. Listando Fornecedores...
curl http://localhost:8000/suppliers
echo.
echo.

echo 4. Listando Manutencoes...
curl http://localhost:8000/maintenance
echo.
echo.

echo 5. Testando Checklist...
curl -X POST http://localhost:8000/maintenance/1/checklist -H "Content-Type: application/json" -d "{\"item\":\"Troca de oleo\",\"responsavel\":\"Tecnico\"}"
echo.
echo.

echo ========================================
echo Testes concluidos!
echo Acesse http://localhost:5173 para ver a interface
echo ========================================
pause 