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