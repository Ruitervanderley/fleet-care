# Script para extrair tags do Excel e comparar
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Extraindo Tags do Excel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verificar se o arquivo Excel existe
$excelFile = "PRODUTIVIDADE EQUIPAMENTOS.xlsx"
if (-not (Test-Path $excelFile)) {
    Write-Host "❌ Arquivo '$excelFile' não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Arquivo Excel: $excelFile" -ForegroundColor Green

# Tentar extrair tags usando diferentes métodos
Write-Host "`n🔍 Tentando extrair tags do Excel..." -ForegroundColor Yellow

try {
    # Método 1: Usando Excel COM object
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open((Resolve-Path $excelFile).Path)
    $worksheet = $workbook.Worksheets.Item(1)
    
    $usedRange = $worksheet.UsedRange
    $rows = $usedRange.Rows.Count
    $cols = $usedRange.Columns.Count
    
    Write-Host "📊 Planilha tem $rows linhas e $cols colunas" -ForegroundColor Green
    
    $excelTags = @()
    
    # Procurar por tags em todas as células
    for ($row = 1; $row -le $rows; $row++) {
        for ($col = 1; $col -le $cols; $col++) {
            $cellValue = $worksheet.Cells.Item($row, $col).Text
            if ($cellValue -match '^[A-Z]+-\d{4}$') {
                $excelTags += $cellValue
            }
        }
    }
    
    $workbook.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    $excelTags = $excelTags | Sort-Object -Unique
    Write-Host "✅ Encontradas $($excelTags.Count) tags únicas no Excel" -ForegroundColor Green
    
    # Salvar tags do Excel
    $excelTags | Out-File -FilePath "tags_do_excel.txt" -Encoding UTF8
    Write-Host "💾 Tags do Excel salvas em: tags_do_excel.txt" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro ao ler Excel: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tentando método alternativo..." -ForegroundColor Yellow
    
    # Método alternativo: tentar usar Python
    try {
        $pythonScript = @'
import pandas as pd
import re

# Ler o arquivo Excel
df = pd.read_excel('PRODUTIVIDADE EQUIPAMENTOS.xlsx')

# Procurar por tags em todas as colunas
tags = []
for col in df.columns:
    for value in df[col].dropna():
        if re.match(r'^[A-Z]+-\d{4}$', str(value)):
            tags.append(str(value))

# Remover duplicatas e ordenar
tags = sorted(list(set(tags)))

# Salvar em arquivo
with open('tags_do_excel.txt', 'w', encoding='utf-8') as f:
    for tag in tags:
        f.write(tag + '\n')

print(f"Encontradas {len(tags)} tags únicas")
'@
        
        $pythonScript | Out-File -FilePath "extract_tags.py" -Encoding UTF8
        python extract_tags.py
        
        if (Test-Path "tags_do_excel.txt") {
            $excelTags = Get-Content "tags_do_excel.txt"
            Write-Host "✅ Tags extraídas com Python" -ForegroundColor Green
        } else {
            throw "Não foi possível extrair tags"
        }
        
    } catch {
        Write-Host "❌ Erro com Python também: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Ler tags do arquivo tags_pastas.txt
Write-Host "`n📖 Lendo tags do arquivo tags_pastas.txt..." -ForegroundColor Yellow
$pastaTags = Get-Content "tags_pastas.txt" | Where-Object { $_.Trim() -ne "" }
Write-Host "✅ Lidas $($pastaTags.Count) tags do arquivo" -ForegroundColor Green

# Comparar tags
Write-Host "`n🔍 Comparando tags..." -ForegroundColor Yellow

# Tags que estão no Excel mas NÃO no arquivo pasta
$tagsNovas = $excelTags | Where-Object { $_ -notin $pastaTags }

# Tags que estão no arquivo pasta mas NÃO no Excel
$tagsFaltando = $pastaTags | Where-Object { $_ -notin $excelTags }

# Tags que estão em ambos
$tagsComuns = $pastaTags | Where-Object { $_ -in $excelTags }

# Salvar resultados
$tagsNovas | Out-File -FilePath "tags_novas_no_excel.txt" -Encoding UTF8
$tagsFaltando | Out-File -FilePath "tags_faltando_no_excel.txt" -Encoding UTF8
$tagsComuns | Out-File -FilePath "tags_comuns.txt" -Encoding UTF8

# Exibir resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   RESUMO DA COMPARAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "📊 Total no arquivo pasta: $($pastaTags.Count)" -ForegroundColor White
Write-Host "📊 Total no Excel: $($excelTags.Count)" -ForegroundColor White
Write-Host "✅ Tags comuns: $($tagsComuns.Count)" -ForegroundColor Green
Write-Host "🆕 Tags novas no Excel: $($tagsNovas.Count)" -ForegroundColor Blue
Write-Host "❌ Tags faltando no Excel: $($tagsFaltando.Count)" -ForegroundColor Red

# Mostrar tags novas
if ($tagsNovas.Count -gt 0) {
    Write-Host "`n🆕 TAGS NOVAS NO EXCEL:" -ForegroundColor Blue
    $tagsNovas | ForEach-Object { Write-Host "  - $_" -ForegroundColor Blue }
}

# Mostrar tags faltando
if ($tagsFaltando.Count -gt 0) {
    Write-Host "`n❌ TAGS FALTANDO NO EXCEL:" -ForegroundColor Red
    $tagsFaltando | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "`n✅ Comparação concluída!" -ForegroundColor Green 