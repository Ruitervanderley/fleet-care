# Script para comparar TAGs do sistema com lista externa
# Uso: .\compare-tags.ps1 [arquivo_com_todas_as_tags.txt]

param(
    [string]$TodasAsTagsFile = "todas_as_tags.txt"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Comparador de TAGs - Fleet Care" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verificar se o arquivo de entrada existe
if (-not (Test-Path $TodasAsTagsFile)) {
    Write-Host "❌ Arquivo '$TodasAsTagsFile' não encontrado!" -ForegroundColor Red
    Write-Host "Crie um arquivo com uma TAG por linha e execute novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Arquivo de entrada: $TodasAsTagsFile" -ForegroundColor Green

# 1. Extrair TAGs do sistema
Write-Host "`n1️⃣ Extraindo TAGs do sistema..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/dashboard/tags" -Method Get
    $tagsSistema = $response.tags
    $totalSistema = $response.total_tags
    
    Write-Host "✅ Extraídas $totalSistema TAGs do sistema" -ForegroundColor Green
    
    # Salvar TAGs do sistema
    $tagsSistema | Out-File -FilePath "tags_no_sistema.txt" -Encoding UTF8
    Write-Host "💾 TAGs do sistema salvas em: tags_no_sistema.txt" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro ao conectar com o sistema: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifique se o backend está rodando em http://localhost:8000" -ForegroundColor Yellow
    exit 1
}

# 2. Ler TAGs do arquivo de entrada
Write-Host "`n2️⃣ Lendo TAGs do arquivo de entrada..." -ForegroundColor Yellow
$todasAsTags = Get-Content $TodasAsTagsFile | Where-Object { $_.Trim() -ne "" }
$totalArquivo = $todasAsTags.Count

Write-Host "✅ Lidas $totalArquivo TAGs do arquivo" -ForegroundColor Green

# 3. Comparar TAGs
Write-Host "`n3️⃣ Comparando TAGs..." -ForegroundColor Yellow

# TAGs que estão no arquivo mas NÃO no sistema (faltantes)
$tagsFaltantes = $todasAsTags | Where-Object { $_ -notin $tagsSistema }

# TAGs que estão no sistema mas NÃO no arquivo (extras)
$tagsExtras = $tagsSistema | Where-Object { $_ -notin $todasAsTags }

# TAGs que estão em ambos (comuns)
$tagsComuns = $todasAsTags | Where-Object { $_ -in $tagsSistema }

# 4. Salvar resultados
Write-Host "`n4️⃣ Salvando resultados..." -ForegroundColor Yellow

# Salvar TAGs faltantes
$tagsFaltantes | Out-File -FilePath "tags_faltantes.txt" -Encoding UTF8
Write-Host "📄 TAGs faltantes salvas em: tags_faltantes.txt" -ForegroundColor Green

# Salvar TAGs extras
$tagsExtras | Out-File -FilePath "tags_extras.txt" -Encoding UTF8
Write-Host "📄 TAGs extras salvas em: tags_extras.txt" -ForegroundColor Green

# Salvar TAGs comuns
$tagsComuns | Out-File -FilePath "tags_comuns.txt" -Encoding UTF8
Write-Host "📄 TAGs comuns salvas em: tags_comuns.txt" -ForegroundColor Green

# 5. Exibir resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   RESUMO DA COMPARAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "📊 Total no arquivo: $totalArquivo" -ForegroundColor White
Write-Host "📊 Total no sistema: $totalSistema" -ForegroundColor White
Write-Host "✅ TAGs comuns: $($tagsComuns.Count)" -ForegroundColor Green
Write-Host "❌ TAGs faltantes: $($tagsFaltantes.Count)" -ForegroundColor Red
Write-Host "⚠️  TAGs extras: $($tagsExtras.Count)" -ForegroundColor Yellow

# 6. Mostrar TAGs faltantes (se houver)
if ($tagsFaltantes.Count -gt 0) {
    Write-Host "`n🔍 TAGs FALTANTES (não estão no sistema):" -ForegroundColor Red
    $tagsFaltantes | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    
    Write-Host "`n💡 O que fazer com as TAGs faltantes:" -ForegroundColor Cyan
    Write-Host "  • Máquina ativa: Adicione o primeiro lançamento na planilha PRODUTIVIDADE" -ForegroundColor White
    Write-Host "  • Máquina parada: Ignore ou marque como inativa (próxima sprint)" -ForegroundColor White
    Write-Host "  • Sem horímetro: Pode ficar sem intervalo" -ForegroundColor White
}

# 7. Mostrar TAGs extras (se houver)
if ($tagsExtras.Count -gt 0) {
    Write-Host "`n🔍 TAGs EXTRAS (estão no sistema mas não no arquivo):" -ForegroundColor Yellow
    $tagsExtras | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}

Write-Host "`n✅ Comparação concluída!" -ForegroundColor Green
Write-Host "📁 Arquivos gerados:" -ForegroundColor Cyan
Write-Host "  • tags_no_sistema.txt - TAGs do sistema" -ForegroundColor White
Write-Host "  • tags_faltantes.txt - TAGs que faltam no sistema" -ForegroundColor White
Write-Host "  • tags_extras.txt - TAGs extras no sistema" -ForegroundColor White
Write-Host "  • tags_comuns.txt - TAGs em ambos" -ForegroundColor White 