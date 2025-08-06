import os
import datetime as dt
import pandas as pd
import sqlite3
import uvicorn
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from pathlib import Path
from config_manager import ConfigManager
from advanced_importer import AdvancedImporter

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv(".env")

# Validação das variáveis de ambiente
CAMINHO_PLANILHA = os.getenv("CAMINHO_PLANILHA")
if not CAMINHO_PLANILHA:
    logger.warning("CAMINHO_PLANILHA não definida - importação manual será necessária")
    PLANILHA = None
else:
    # Se estiver rodando no Docker, usar o caminho montado
    if os.path.exists("/app/planilha.xlsx"):
        PLANILHA = Path("/app/planilha.xlsx")
        logger.info("Usando planilha montada no Docker: /app/planilha.xlsx")
    else:
        # Resolver caminho relativo corretamente
        if CAMINHO_PLANILHA.startswith("../"):
            # Se for caminho relativo, resolver a partir do diretório atual
            PLANILHA = Path(CAMINHO_PLANILHA).resolve()
        else:
            PLANILHA = Path(CAMINHO_PLANILHA)
        logger.info(f"Usando planilha: {PLANILHA}")

HORA_IMPORT = os.getenv("HORA_IMPORT", "10:05")
TZ = os.getenv("TZ", "America/Sao_Paulo")
DB_PATH = Path("/db/arruda.db")

app = FastAPI(title="Arruda Fleet Care – Fase 1")

# Adicionar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def slug(c: str) -> str:
    import unicodedata
    import re
    s = unicodedata.normalize("NFKD", c).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")

def cria_db():
    """Cria o banco de dados e as tabelas se não existirem"""
    try:
        DB_PATH.parent.mkdir(exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""CREATE TABLE IF NOT EXISTS equipamentos(
            tag TEXT PRIMARY KEY,
            tipo TEXT NOT NULL,
            intervalo REAL DEFAULT 0,
            ultima_manut REAL DEFAULT 0
        )""")
        
        cur.execute("""CREATE TABLE IF NOT EXISTS lancamentos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag TEXT,
            data DATE,
            h_final REAL,
            FOREIGN KEY(tag) REFERENCES equipamentos(tag)
        )""")
        
        # Novas tabelas para gestão de manutenções
        cur.execute("""CREATE TABLE IF NOT EXISTS fornecedores(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cnpj TEXT UNIQUE,
            telefone TEXT,
            email TEXT,
            endereco TEXT,
            especialidade TEXT,
            ativo BOOLEAN DEFAULT 1
        )""")
        
        cur.execute("""CREATE TABLE IF NOT EXISTS manutencoes(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag TEXT NOT NULL,
            tipo_manutencao TEXT NOT NULL,
            data_agendada DATE,
            data_realizada DATE,
            fornecedor_id INTEGER,
            valor_orcado REAL,
            valor_real REAL,
            status TEXT DEFAULT 'AGENDADA',
            observacoes TEXT,
            proxima_manutencao DATE,
            horas_km_manutencao REAL,
            execucao TEXT,
            responsavel TEXT,
            reprogramacao TEXT,
            numero_os TEXT,
            FOREIGN KEY(tag) REFERENCES equipamentos(tag),
            FOREIGN KEY(fornecedor_id) REFERENCES fornecedores(id)
        )""")
        
        cur.execute("""CREATE TABLE IF NOT EXISTS checklists_manutencao(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manutencao_id INTEGER NOT NULL,
            item TEXT NOT NULL,
            status TEXT DEFAULT 'PENDENTE',
            observacao TEXT,
            responsavel TEXT,
            data_conclusao DATETIME,
            FOREIGN KEY(manutencao_id) REFERENCES manutencoes(id)
        )""")
        
        cur.execute("""CREATE TABLE IF NOT EXISTS agendamentos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manutencao_id INTEGER NOT NULL,
            data_hora DATETIME NOT NULL,
            duracao_estimada INTEGER DEFAULT 60,
            local TEXT,
            responsavel TEXT,
            status TEXT DEFAULT 'CONFIRMADO',
            FOREIGN KEY(manutencao_id) REFERENCES manutencoes(id)
        )""")
        
        conn.commit()
        conn.close()
        logger.info("Banco de dados criado/verificado com sucesso")
    except Exception as e:
        logger.error(f"Erro ao criar banco de dados: {e}")
        raise

def importar_planilha():
    """Importa dados da planilha Excel para o banco de dados"""
    try:
        if PLANILHA is None:
            logger.error("CAMINHO_PLANILHA não configurada. Configure no arquivo .env")
            return
            
        if not PLANILHA.exists():
            logger.warning(f"Planilha não encontrada: {PLANILHA}")
            return

        df = pd.read_excel(PLANILHA, sheet_name="PRODUTIVIDADE", header=2)
        df.columns = [slug(c) for c in df.columns]
        
        obrig = {"tag", "data", "h_final"}
        if not obrig.issubset(df.columns):
            logger.error("Cabeçalho inesperado na planilha!")
            return

        df = df.dropna(subset=["tag", "data", "h_final"]).copy()
        df["tag"] = df["tag"].astype(str).str.strip().str.upper()
        df["data"] = pd.to_datetime(df["data"]).dt.date
        df["h_final"] = pd.to_numeric(df["h_final"], errors="coerce").fillna(0)

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        for tag, grp in df.groupby("tag"):
            h_ult = grp.sort_values("data").iloc[-1]["h_final"]
            tipo = str(grp.iloc[0]["atividade"]).strip().upper() if "atividade" in grp.columns else ""
            # Buscar coluna 'Tipo' de forma robusta
            intervalo_col = next((col for col in grp.columns if col.strip().lower() == "tipo"), None)
            if intervalo_col:
                try:
                    intervalo = float(grp.iloc[0][intervalo_col])
                except Exception:
                    intervalo = 0
            else:
                intervalo = 0
            print(f"[IMPORT] {tag}: intervalo lido = {intervalo}")
            cur.execute("""INSERT OR IGNORE INTO equipamentos(tag,tipo,intervalo) VALUES(?,?,?)""",
                        (tag, tipo, intervalo))
            cur.execute("""UPDATE equipamentos SET ultima_manut = COALESCE(ultima_manut, ?), intervalo = ? 
                           WHERE tag = ?""", (h_ult, intervalo, tag))
            # lançamentos
            cur.executemany("""INSERT INTO lancamentos(tag,data,h_final) VALUES(?,?,?)""",
                            grp[["tag","data","h_final"]].values.tolist())

        # Importar OS/manutenções da aba CONTROLE DE OS
        try:
            df_os = pd.read_excel(PLANILHA, sheet_name="CONTROLE DE OS")
            df_os.columns = [slug(c) for c in df_os.columns]  # slugifica os cabeçalhos
            for _, row in df_os.iterrows():
                tag = str(row.get("equipamento", "")).strip().upper()
                numero_os = str(row.get("n_os", "")).strip()
                data = row.get("data", "")
                if hasattr(data, "date"):
                    data = data.date().isoformat()
                else:
                    data = str(data)
                tipo_manutencao = str(row.get("tipo_de_manutencao", "")).strip()
                falha = str(row.get("falha_apresentada", "")).strip()
                execucao = str(row.get("execucao", "")).strip()
                responsavel = str(row.get("responsavel_da_manutencao", "")).strip() if "responsavel_da_manutencao" in row else ""
                reprogramacao = str(row.get("reprogramacao", "")).strip() if "reprogramacao" in row else ""
                observacoes = str(row.get("observacoes", "")).strip() if "observacoes" in row else ""
                # Inserir manutenção no banco
                cur.execute("""
                    INSERT INTO manutencoes (tag, tipo_manutencao, data_agendada, status, observacoes, execucao, responsavel, reprogramacao, numero_os)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    tag,
                    tipo_manutencao,
                    data,
                    "REALIZADA",
                    observacoes,
                    execucao,
                    responsavel,
                    reprogramacao,
                    numero_os
                ))
                print(f"[IMPORT OS] {tag} | OS: {numero_os} | Data: {data} | Tipo: {tipo_manutencao} | Resp: {responsavel}")
        except Exception as e:
            logger.error(f"Erro ao importar OS/manutenções: {e}")

        conn.commit()
        conn.close()
        logger.info(f"Planilha importada com sucesso em {dt.datetime.now()}")
        
    except Exception as e:
        logger.error(f"Erro ao importar planilha: {e}")
        raise

def resumo_dashboard() -> dict:
    """Retorna resumo do dashboard com status dos equipamentos"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        q = cur.execute("""
            SELECT e.tag, e.tipo, e.intervalo, e.ultima_manut,
                   MAX(l.h_final) AS atual,
                   MAX(l.data) AS ultima_atualizacao
            FROM equipamentos e
            LEFT JOIN lancamentos l ON l.tag = e.tag
            GROUP BY e.tag
        """)
        
        status = {"OK": 0, "AMARELO": 0, "VERMELHO": 0, "SEM": 0}
        ultima_atualizacao_geral = None
        
        for tag, tipo, intv, ult, atual, ult_data in q.fetchall():
            intv = intv or 0
            ultima_manut = ult or 0
            atual_valor = atual if atual is not None else ultima_manut
            uso = atual_valor - ultima_manut
            percentual = (uso / intv * 100) if intv > 0 else 0
            
            if intv == 0:
                status["SEM"] += 1
            elif uso >= intv:
                status["VERMELHO"] += 1
            elif uso >= max(intv * 0.9, intv - 20):
                status["AMARELO"] += 1
            else:
                status["OK"] += 1
            
            # Atualizar data mais recente
            if ult_data and (ultima_atualizacao_geral is None or ult_data > ultima_atualizacao_geral):
                ultima_atualizacao_geral = ult_data
                
        conn.close()
        
        # Use a data atual se houver dados, senão None
        agora = dt.datetime.now()
        data_formatada = agora.strftime("%d/%m/%Y às %H:%M") if ultima_atualizacao_geral else None
        
        return {
            **status,
            "ultima_atualizacao": data_formatada
        }
        
    except Exception as e:
        logger.error(f"Erro ao gerar resumo do dashboard: {e}")
        raise

def enviar_relatorio_email():
    """Envia relatório diário por email"""
    try:
        # Configurações de email
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        email_from = os.getenv("EMAIL_FROM")
        email_to = os.getenv("EMAIL_TO")
        email_password = os.getenv("EMAIL_PASSWORD")
        
        if not all([email_from, email_to, email_password]):
            logger.warning("Configurações de email incompletas - relatório não enviado")
            return
        
        # Buscar dados para o relatório
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        q = cur.execute("""
            SELECT e.tag, e.tipo, e.intervalo, e.ultima_manut,
                   MAX(l.h_final) AS atual,
                   MAX(l.data) AS ultima_atualizacao
            FROM equipamentos e
            LEFT JOIN lancamentos l ON l.tag = e.tag
            GROUP BY e.tag
        """)
        
        equipamentos_criticos = []
        proximos_manutencao = []
        sem_atualizacao = []
        
        hoje = dt.date.today()
        
        for tag, tipo, intv, ult, atual, ult_data in q.fetchall():
            intv = intv or 0
            ultima_manut = ult or 0
            atual_valor = atual if atual is not None else ultima_manut
            uso = atual_valor - ultima_manut
            percentual = (uso / intv * 100) if intv > 0 else 0
            
            # Equipamentos críticos
            if intv > 0 and percentual >= 100:
                equipamentos_criticos.append({
                    "tag": tag,
                    "tipo": tipo,
                    "uso": uso,
                    "intervalo": intv,
                    "percentual": percentual
                })
            
            # Próximos da manutenção
            elif intv > 0 and percentual >= 90:
                proximos_manutencao.append({
                    "tag": tag,
                    "tipo": tipo,
                    "uso": uso,
                    "intervalo": intv,
                    "percentual": percentual
                })
            
            # Sem atualização recente
            if ult_data:
                # Converter string para date se necessário
                if isinstance(ult_data, str):
                    ult_data_date = dt.datetime.strptime(ult_data, '%Y-%m-%d').date()
                else:
                    ult_data_date = ult_data
                
                if (hoje - ult_data_date).days > 7:
                    sem_atualizacao.append({
                        "tag": tag,
                        "tipo": tipo,
                        "dias_sem_atualizacao": (hoje - ult_data_date).days,
                        "ultima_atualizacao": str(ult_data)
                    })
        
        conn.close()
        
        # Criar conteúdo do email
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background-color: #4299e1; color: white; padding: 20px; text-align: center; }}
                .section {{ margin: 20px 0; padding: 15px; border-radius: 5px; }}
                .critical {{ background-color: #fed7d7; border-left: 4px solid #e53e3e; }}
                .warning {{ background-color: #fef5e7; border-left: 4px solid #ed8936; }}
                .info {{ background-color: #f7fafc; border-left: 4px solid #a0aec0; }}
                .equipment {{ margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }}
                .footer {{ text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚛 Relatório Fleet Care - {hoje.strftime('%d/%m/%Y')}</h1>
            </div>
            
            <div class="section critical">
                <h2>🚨 Equipamentos Críticos ({len(equipamentos_criticos)})</h2>
                {''.join([f'<div class="equipment"><strong>{eq["tag"]}</strong> - {eq["uso"]} {eq["tipo"]} ({eq["percentual"]:.1f}% do intervalo)</div>' for eq in equipamentos_criticos]) if equipamentos_criticos else '<p>Nenhum equipamento crítico</p>'}
            </div>
            
            <div class="section warning">
                <h2>⚠️ Próximos da Manutenção ({len(proximos_manutencao)})</h2>
                {''.join([f'<div class="equipment"><strong>{eq["tag"]}</strong> - {eq["uso"]} {eq["tipo"]} ({eq["percentual"]:.1f}% do intervalo)</div>' for eq in proximos_manutencao]) if proximos_manutencao else '<p>Nenhum equipamento próximo da manutenção</p>'}
            </div>
            
            <div class="section info">
                <h2>📊 Sem Atualização Recente ({len(sem_atualizacao)})</h2>
                {''.join([f'<div class="equipment"><strong>{eq["tag"]}</strong> - {eq["dias_sem_atualizacao"]} dias sem atualização</div>' for eq in sem_atualizacao]) if sem_atualizacao else '<p>Todos os equipamentos atualizados</p>'}
            </div>
            
            <div class="footer">
                <p>Relatório gerado automaticamente pelo Fleet Care</p>
                <p>Data: {dt.datetime.now().strftime('%d/%m/%Y às %H:%M')}</p>
            </div>
        </body>
        </html>
        """
        
        # Configurar email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Relatório Fleet Care - {hoje.strftime("%d/%m/%Y")}'
        msg['From'] = email_from
        msg['To'] = email_to
        
        msg.attach(MIMEText(html_content, 'html'))
        
        # Enviar email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(email_from, email_password)
            server.send_message(msg)
        
        logger.info(f"Relatório enviado por email em {dt.datetime.now()}")
        
    except Exception as e:
        logger.error(f"Erro ao enviar relatório por email: {e}")

# Variável global para o scheduler
scheduler = None

@app.on_event("startup")
def startup():
    """Inicializa o aplicativo e agenda a importação automática"""
    try:
        global scheduler
        cria_db()
        importar_planilha()  # Importa a última planilha ao iniciar o backend
        scheduler = BackgroundScheduler(timezone=TZ)
        
        # Carregar configurações salvas
        config = config_manager.load_config()
        
        # Configurar importação automática se habilitada
        if config.get("autoImport") and config.get("enabled"):
            import_time = f"{config.get('importHour', '10')}:{config.get('importMinute', '05')}"
            scheduler.add_job(
                importar_planilha,
                'cron',
                hour=int(config.get('importHour', 10)),
                minute=int(config.get('importMinute', 5)),
                id='auto_import',
                name='Importação Automática'
            )
            logger.info(f"Importação automática agendada para {import_time}")
        else:
            # Usar configuração padrão se não configurado
            h, m = map(int, HORA_IMPORT.split(":"))
            scheduler.add_job(importar_planilha, "cron", hour=h, minute=m)
            logger.info(f"Usando configuração padrão - importação diária às {HORA_IMPORT}")
        
        # Relatório diário por email (às 8:00)
        scheduler.add_job(enviar_relatorio_email, "cron", hour=8, minute=0)
        
        scheduler.start()
        logger.info("Agendador iniciado com sucesso")
    except Exception as e:
        logger.error(f"Erro na inicialização: {e}")
        raise

@app.get("/import")
def import_now(tasks: BackgroundTasks):
    """Endpoint para importar planilha manualmente"""
    try:
        tasks.add_task(importar_planilha)
        return {"detail": "Importação agendada"}
    except Exception as e:
        logger.error(f"Erro ao agendar importação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/dashboard")
def dashboard():
    """Endpoint para obter resumo do dashboard"""
    try:
        return resumo_dashboard()
    except Exception as e:
        logger.error(f"Erro ao obter dashboard: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/equipment")
def equipment_list():
    """Endpoint para obter lista detalhada de equipamentos"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        q = cur.execute("""
            SELECT e.tag, e.tipo, e.intervalo, e.ultima_manut,
                   MAX(l.h_final) AS atual,
                   MAX(l.data) AS ultima_atualizacao
            FROM equipamentos e
            LEFT JOIN lancamentos l ON l.tag = e.tag
            GROUP BY e.tag
            ORDER BY e.tag
        """)
        
        equipment = []
        for tag, tipo, intv, ult, atual, ult_data in q.fetchall():
            # Fix: Properly handle null values
            ultima_manut = ult or 0
            atual_valor = atual if atual is not None else ultima_manut
            intervalo = intv or 0
            
            equipment.append({
                "tag": tag,
                "tipo": tipo,
                "intervalo": intervalo,
                "ultima_manut": ultima_manut,
                "atual": atual_valor,
                "ultima_atualizacao": ult_data
            })
                
        conn.close()
        return equipment
        
    except Exception as e:
        logger.error(f"Erro ao obter lista de equipamentos: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/equipment/{tag}")
def equipment_detail(tag: str):
    """Endpoint para obter detalhes de um equipamento específico"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Dados do equipamento
        cur.execute("""
            SELECT e.tag, e.tipo, e.intervalo, e.ultima_manut,
                   MAX(l.h_final) AS atual
            FROM equipamentos e
            LEFT JOIN lancamentos l ON l.tag = e.tag
            WHERE e.tag = ?
            GROUP BY e.tag
        """, (tag,))
        
        equip = cur.fetchone()
        if not equip:
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
            
        tag, tipo, intv, ult, atual = equip
        
        # Histórico dos últimos 30 dias
        cur.execute("""
            SELECT data, h_final
            FROM lancamentos
            WHERE tag = ?
            ORDER BY data DESC
            LIMIT 30
        """, (tag,))
        
        historico = [{"data": str(data), "h_final": h_final} for data, h_final in cur.fetchall()]
        
        conn.close()
        
        return {
            "tag": tag,
            "tipo": tipo,
            "intervalo": intv or 0,
            "ultima_manut": ult or 0,
            "atual": atual if atual is not None else (ult or 0),
            "historico": historico
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter detalhes do equipamento {tag}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/equipment/{tag}/interval")
def update_equipment_interval(tag: str, intervalo: float):
    """Endpoint para atualizar o intervalo de manutenção de um equipamento"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE equipamentos 
            SET intervalo = ? 
            WHERE tag = ?
        """, (intervalo, tag))
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
        
        conn.commit()
        conn.close()
        
        logger.info(f"Intervalo atualizado para {tag}: {intervalo}")
        return {"detail": f"Intervalo atualizado para {tag}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar intervalo do equipamento {tag}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.put("/equipment/{tag}/interval")
def edit_equipment_interval(tag: str, intervalo: float):
    """Endpoint para editar o intervalo de manutenção de um equipamento"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Verificar se o equipamento existe
        cur.execute("SELECT tag FROM equipamentos WHERE tag = ?", (tag,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
        
        cur.execute("""
            UPDATE equipamentos 
            SET intervalo = ? 
            WHERE tag = ?
        """, (intervalo, tag))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Intervalo editado para {tag}: {intervalo}")
        return {"detail": f"Intervalo editado para {tag}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao editar intervalo do equipamento {tag}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.delete("/equipment/{tag}/interval")
def delete_equipment_interval(tag: str):
    """Endpoint para remover o intervalo de manutenção de um equipamento"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Verificar se o equipamento existe
        cur.execute("SELECT tag FROM equipamentos WHERE tag = ?", (tag,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Equipamento não encontrado")
        
        cur.execute("""
            UPDATE equipamentos 
            SET intervalo = 0 
            WHERE tag = ?
        """, (tag,))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Intervalo removido para {tag}")
        return {"detail": f"Intervalo removido para {tag}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao remover intervalo do equipamento {tag}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/")
def root():
    """Endpoint raiz com informações básicas"""
    return {
        "app": "Arruda Fleet Care - Fase 1",
        "status": "running",
        "planilha": str(PLANILHA) if PLANILHA else "Não configurada",
        "planilha_existe": PLANILHA.exists() if PLANILHA else False,
        "configuracao": "Configure CAMINHO_PLANILHA no arquivo .env" if PLANILHA is None else "OK",
        "endpoints": {
            "docs": "/docs",
            "dashboard": "/dashboard",
            "import": "/import"
        }
    }

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": dt.datetime.now().isoformat()}

@app.get("/export")
def export_dashboard():
    """Endpoint para exportar dados do dashboard em Excel"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Buscar dados completos
        q = cur.execute("""
            SELECT e.tag, e.tipo, e.intervalo, e.ultima_manut,
                   MAX(l.h_final) AS atual,
                   MAX(l.data) AS ultima_atualizacao
            FROM equipamentos e
            LEFT JOIN lancamentos l ON l.tag = e.tag
            GROUP BY e.tag
            ORDER BY e.tag
        """)
        
        # Criar DataFrame
        data = []
        for tag, tipo, intv, ult, atual, ult_data in q.fetchall():
            intv = intv or 0
            ultima_manut = ult or 0
            atual_valor = atual if atual is not None else ultima_manut
            uso = atual_valor - ultima_manut
            percentual = (uso / intv * 100) if intv > 0 else 0
            
            # Determinar status
            if intv == 0:
                status = "SEM INTERVALO"
            elif uso >= intv:
                status = "CRÍTICO"
            elif uso >= max(intv * 0.9, intv - 20):
                status = "ATENÇÃO"
            else:
                status = "OK"
            
            data.append({
                "TAG": tag,
                "TIPO": tipo,
                "ÚLTIMA MANUTENÇÃO": ultima_manut,
                "ATUAL": atual_valor,
                "USO DESDE MANUTENÇÃO": uso,
                "INTERVALO": intv,
                "PERCENTUAL": f"{percentual:.1f}%" if intv > 0 else "N/A",
                "STATUS": status,
                "ÚLTIMA ATUALIZAÇÃO": str(ult_data) if ult_data else "N/A"
            })
        
        conn.close()
        
        # Criar Excel
        df = pd.DataFrame(data)
        
        # Criar arquivo temporário
        timestamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"fleet_care_status_{timestamp}.xlsx"
        filepath = f"/tmp/{filename}"
        
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Status Equipamentos', index=False)
            
            # Adicionar resumo
            resumo = resumo_dashboard()
            resumo_df = pd.DataFrame([{
                "Status": "OK",
                "Quantidade": resumo["OK"],
                "Descrição": "Dentro do intervalo de manutenção"
            }, {
                "Status": "ATENÇÃO", 
                "Quantidade": resumo["AMARELO"],
                "Descrição": "Próximo da manutenção (90% ou -20 unidades)"
            }, {
                "Status": "CRÍTICO",
                "Quantidade": resumo["VERMELHO"], 
                "Descrição": "Acima do intervalo de manutenção"
            }, {
                "Status": "SEM INTERVALO",
                "Quantidade": resumo["SEM"],
                "Descrição": "Intervalo não definido"
            }])
            
            resumo_df.to_excel(writer, sheet_name='Resumo', index=False)
        
        # Ler arquivo e retornar
        with open(filepath, 'rb') as f:
            content = f.read()
        
        # Limpar arquivo temporário
        os.remove(filepath)
        
        from fastapi.responses import Response
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Erro ao exportar dashboard: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/dashboard/tags")
def get_all_tags():
    """Endpoint para obter todas as TAGs reconhecidas pelo sistema"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Buscar todas as TAGs ordenadas
        cur.execute("""
            SELECT DISTINCT tag 
            FROM equipamentos 
            ORDER BY tag
        """)
        
        tags = [row[0] for row in cur.fetchall()]
        conn.close()
        
        return {
            "total_tags": len(tags),
            "tags": tags,
            "exportado_em": dt.datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter TAGs: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/dashboard/alerts")
def get_dashboard_alerts():
    """Endpoint para obter alertas críticos e estatísticas detalhadas"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Buscar dados completos
        q = cur.execute("""
            SELECT e.tag, e.tipo, e.intervalo, e.ultima_manut,
                   MAX(l.h_final) AS atual,
                   MAX(l.data) AS ultima_atualizacao
            FROM equipamentos e
            LEFT JOIN lancamentos l ON l.tag = e.tag
            GROUP BY e.tag
        """)
        
        equipamentos = []
        alertas_criticos = []
        proximos_manutencao = []
        sem_atualizacao = []
        total_horimetros = 0
        total_kms = 0
        
        hoje = dt.date.today()
        
        for tag, tipo, intv, ult, atual, ult_data in q.fetchall():
            intv = intv or 0
            ultima_manut = ult or 0
            atual_valor = atual if atual is not None else ultima_manut
            uso = atual_valor - ultima_manut
            percentual = (uso / intv * 100) if intv > 0 else 0
            
            # Acumular totais
            if tipo == "KM":
                total_kms += atual_valor
            else:
                total_horimetros += atual_valor
            
            # Verificar alertas críticos (100% ou mais)
            if intv > 0 and percentual >= 100:
                alertas_criticos.append({
                    "tag": tag,
                    "tipo": tipo,
                    "uso": uso,
                    "intervalo": intv,
                    "percentual": percentual,
                    "ultima_atualizacao": str(ult_data) if ult_data else None
                })
            
            # Verificar próximos da manutenção (90-99%)
            elif intv > 0 and percentual >= 90:
                proximos_manutencao.append({
                    "tag": tag,
                    "tipo": tipo,
                    "uso": uso,
                    "intervalo": intv,
                    "percentual": percentual,
                    "dias_restantes": max(0, int((intv - uso) / (8 if tipo == "HORAS" else 100)))
                })
            
            # Verificar sem atualização recente (>7 dias)
            if ult_data:
                # Converter string para date se necessário
                if isinstance(ult_data, str):
                    ult_data_date = dt.datetime.strptime(ult_data, '%Y-%m-%d').date()
                else:
                    ult_data_date = ult_data
                
                if (hoje - ult_data_date).days > 7:
                    sem_atualizacao.append({
                        "tag": tag,
                        "tipo": tipo,
                        "dias_sem_atualizacao": (hoje - ult_data_date).days,
                        "ultima_atualizacao": str(ult_data)
                    })
            
            equipamentos.append({
                "tag": tag,
                "tipo": tipo,
                "intervalo": intv,
                "ultima_manut": ult or 0,
                "atual": atual or ult or 0,
                "uso": uso,
                "percentual": percentual,
                "ultima_atualizacao": str(ult_data) if ult_data else None
            })
        
        conn.close()
        
        return {
            "alertas_criticos": alertas_criticos,
            "proximos_manutencao": proximos_manutencao,
            "sem_atualizacao": sem_atualizacao,
            "estatisticas": {
                "total_equipamentos": len(equipamentos),
                "total_horimetros": total_horimetros,
                "total_kms": total_kms,
                "equipamentos_criticos": len(alertas_criticos),
                "proximos_manutencao": len(proximos_manutencao),
                "sem_atualizacao_recente": len(sem_atualizacao)
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter alertas do dashboard: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/send-report")
def send_report_manual(tasks: BackgroundTasks):
    """Endpoint para enviar relatório por email manualmente"""
    try:
        tasks.add_task(enviar_relatorio_email)
        return {"detail": "Relatório agendado para envio"}
    except Exception as e:
        logger.error(f"Erro ao agendar envio de relatório: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ===== ENDPOINTS DE GESTÃO DE MANUTENÇÕES =====

@app.get("/maintenance")
def get_maintenance_list():
    """Lista todas as manutenções"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT m.id, m.tag, m.tipo_manutencao, m.data_agendada, m.data_realizada,
                   m.valor_orcado, m.valor_real, m.status, m.observacoes,
                   f.nome as fornecedor_nome, f.telefone as fornecedor_telefone
            FROM manutencoes m
            LEFT JOIN fornecedores f ON m.fornecedor_id = f.id
            ORDER BY m.data_agendada DESC, m.id DESC
        """)
        
        manutencoes = []
        for row in cur.fetchall():
            manutencoes.append({
                "id": row[0],
                "tag": row[1],
                "tipo_manutencao": row[2],
                "data_agendada": row[3],
                "data_realizada": row[4],
                "valor_orcado": row[5],
                "valor_real": row[6],
                "status": row[7],
                "observacoes": row[8],
                "fornecedor_nome": row[9],
                "fornecedor_telefone": row[10]
            })
        
        conn.close()
        return {"manutencoes": manutencoes}
        
    except Exception as e:
        logger.error(f"Erro ao listar manutenções: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/maintenance")
def create_maintenance(manutencao: dict):
    """Cria uma nova manutenção"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO manutencoes (tag, tipo_manutencao, data_agendada, fornecedor_id, 
                                   valor_orcado, observacoes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            manutencao["tag"],
            manutencao["tipo_manutencao"],
            manutencao.get("data_agendada"),
            manutencao.get("fornecedor_id"),
            manutencao.get("valor_orcado"),
            manutencao.get("observacoes"),
            manutencao.get("status", "AGENDADA")
        ))
        
        manutencao_id = cur.lastrowid
        
        # Criar agendamento se data_agendada fornecida
        if manutencao.get("data_agendada"):
            cur.execute("""
                INSERT INTO agendamentos (manutencao_id, data_hora, duracao_estimada, 
                                        local, responsavel)
                VALUES (?, ?, ?, ?, ?)
            """, (
                manutencao_id,
                manutencao["data_agendada"] + " 08:00:00",  # Horário padrão
                manutencao.get("duracao_estimada", 60),
                manutencao.get("local", "Oficina"),
                manutencao.get("responsavel")
            ))
        
        conn.commit()
        conn.close()
        
        return {"id": manutencao_id, "message": "Manutenção criada com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao criar manutenção: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/maintenance/{manutencao_id}")
def get_maintenance_detail(manutencao_id: int):
    """Obtém detalhes de uma manutenção específica"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Buscar manutenção
        cur.execute("""
            SELECT m.*, f.nome as fornecedor_nome, f.telefone, f.email, f.endereco
            FROM manutencoes m
            LEFT JOIN fornecedores f ON m.fornecedor_id = f.id
            WHERE m.id = ?
        """, (manutencao_id,))
        
        manutencao = cur.fetchone()
        if not manutencao:
            raise HTTPException(status_code=404, detail="Manutenção não encontrada")
        
        # Buscar checklist
        cur.execute("""
            SELECT id, item, status, observacao, responsavel, data_conclusao
            FROM checklists_manutencao
            WHERE manutencao_id = ?
            ORDER BY id
        """, (manutencao_id,))
        
        checklist = []
        for row in cur.fetchall():
            checklist.append({
                "id": row[0],
                "item": row[1],
                "status": row[2],
                "observacao": row[3],
                "responsavel": row[4],
                "data_conclusao": row[5]
            })
        
        # Buscar agendamentos
        cur.execute("""
            SELECT id, data_hora, duracao_estimada, local, responsavel, status
            FROM agendamentos
            WHERE manutencao_id = ?
            ORDER BY data_hora
        """, (manutencao_id,))
        
        agendamentos = []
        for row in cur.fetchall():
            agendamentos.append({
                "id": row[0],
                "data_hora": row[1],
                "duracao_estimada": row[2],
                "local": row[3],
                "responsavel": row[4],
                "status": row[5]
            })
        
        conn.close()
        
        return {
            "manutencao": {
                "id": manutencao[0],
                "tag": manutencao[1],
                "tipo_manutencao": manutencao[2],
                "data_agendada": manutencao[3],
                "data_realizada": manutencao[4],
                "fornecedor_id": manutencao[5],
                "valor_orcado": manutencao[6],
                "valor_real": manutencao[7],
                "status": manutencao[8],
                "observacoes": manutencao[9],
                "proxima_manutencao": manutencao[10],
                "horas_km_manutencao": manutencao[11],
                "fornecedor_nome": manutencao[12],
                "fornecedor_telefone": manutencao[13],
                "fornecedor_email": manutencao[14],
                "fornecedor_endereco": manutencao[15]
            },
            "checklist": checklist,
            "agendamentos": agendamentos
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter detalhes da manutenção: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.put("/maintenance/{manutencao_id}")
def update_maintenance(manutencao_id: int, manutencao: dict):
    """Atualiza uma manutenção"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Verificar se existe
        cur.execute("SELECT id FROM manutencoes WHERE id = ?", (manutencao_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Manutenção não encontrada")
        
        # Atualizar campos fornecidos
        campos = []
        valores = []
        for campo, valor in manutencao.items():
            if campo in ["tag", "tipo_manutencao", "data_agendada", "data_realizada", 
                        "fornecedor_id", "valor_orcado", "valor_real", "status", 
                        "observacoes", "proxima_manutencao", "horas_km_manutencao"]:
                campos.append(f"{campo} = ?")
                valores.append(valor)
        
        if campos:
            valores.append(manutencao_id)
            cur.execute(f"UPDATE manutencoes SET {', '.join(campos)} WHERE id = ?", valores)
            conn.commit()
        
        conn.close()
        return {"message": "Manutenção atualizada com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao atualizar manutenção: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/suppliers")
def get_suppliers():
    """Lista todos os fornecedores"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, nome, cnpj, telefone, email, endereco, especialidade, ativo
            FROM fornecedores
            ORDER BY nome
        """)
        
        fornecedores = []
        for row in cur.fetchall():
            fornecedores.append({
                "id": row[0],
                "nome": row[1],
                "cnpj": row[2],
                "telefone": row[3],
                "email": row[4],
                "endereco": row[5],
                "especialidade": row[6],
                "ativo": bool(row[7])
            })
        
        conn.close()
        return {"fornecedores": fornecedores}
        
    except Exception as e:
        logger.error(f"Erro ao listar fornecedores: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/suppliers")
def create_supplier(fornecedor: dict):
    """Cria um novo fornecedor"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco, especialidade)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            fornecedor["nome"],
            fornecedor.get("cnpj"),
            fornecedor.get("telefone"),
            fornecedor.get("email"),
            fornecedor.get("endereco"),
            fornecedor.get("especialidade")
        ))
        
        fornecedor_id = cur.lastrowid
        conn.commit()
        conn.close()
        
        return {"id": fornecedor_id, "message": "Fornecedor criado com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao criar fornecedor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/maintenance/{manutencao_id}/checklist")
def add_checklist_item(manutencao_id: int, item: dict):
    """Adiciona item ao checklist de uma manutenção"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO checklists_manutencao (manutencao_id, item, responsavel)
            VALUES (?, ?, ?)
        """, (manutencao_id, item["item"], item.get("responsavel")))
        
        conn.commit()
        conn.close()
        
        return {"message": "Item adicionado ao checklist"}
        
    except Exception as e:
        logger.error(f"Erro ao adicionar item ao checklist: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.put("/maintenance/checklist/{item_id}")
def update_checklist_item(item_id: int, item: dict):
    """Atualiza item do checklist"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE checklists_manutencao 
            SET status = ?, observacao = ?, responsavel = ?, data_conclusao = ?
            WHERE id = ?
        """, (
            item.get("status", "PENDENTE"),
            item.get("observacao"),
            item.get("responsavel"),
            item.get("data_conclusao"),
            item_id
        ))
        
        conn.commit()
        conn.close()
        
        return {"message": "Item do checklist atualizado"}
        
    except Exception as e:
        logger.error(f"Erro ao atualizar item do checklist: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/maintenance/schedule")
def get_maintenance_schedule():
    """Obtém agenda de manutenções"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT m.id, m.tag, m.tipo_manutencao, m.data_agendada, m.status,
                   f.nome as fornecedor_nome, a.data_hora, a.local, a.responsavel
            FROM manutencoes m
            LEFT JOIN fornecedores f ON m.fornecedor_id = f.id
            LEFT JOIN agendamentos a ON m.id = a.manutencao_id
            WHERE m.data_agendada IS NOT NULL
            ORDER BY m.data_agendada ASC
        """)
        
        agenda = []
        for row in cur.fetchall():
            agenda.append({
                "id": row[0],
                "tag": row[1],
                "tipo_manutencao": row[2],
                "data_agendada": row[3],
                "status": row[4],
                "fornecedor_nome": row[5],
                "data_hora": row[6],
                "local": row[7],
                "responsavel": row[8]
            })
        
        conn.close()
        return {"agenda": agenda}
        
    except Exception as e:
        logger.error(f"Erro ao obter agenda: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.put("/suppliers/{supplier_id}")
def update_supplier(supplier_id: int, fornecedor: dict):
    """Atualiza um fornecedor"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Verificar se existe
        cur.execute("SELECT id FROM fornecedores WHERE id = ?", (supplier_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
        
        # Atualizar campos fornecidos
        campos = []
        valores = []
        for campo, valor in fornecedor.items():
            if campo in ["nome", "cnpj", "telefone", "email", "endereco", "especialidade", "ativo"]:
                campos.append(f"{campo} = ?")
                valores.append(valor)
        
        if campos:
            valores.append(supplier_id)
            cur.execute(f"UPDATE fornecedores SET {', '.join(campos)} WHERE id = ?", valores)
            conn.commit()
        
        conn.close()
        return {"message": "Fornecedor atualizado com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao atualizar fornecedor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int):
    """Exclui um fornecedor"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Verificar se existe
        cur.execute("SELECT id FROM fornecedores WHERE id = ?", (supplier_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
        
        # Verificar se está sendo usado em manutenções
        cur.execute("SELECT COUNT(*) FROM manutencoes WHERE fornecedor_id = ?", (supplier_id,))
        if cur.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="Fornecedor não pode ser excluído pois está sendo usado em manutenções")
        
        cur.execute("DELETE FROM fornecedores WHERE id = ?", (supplier_id,))
        conn.commit()
        conn.close()
        
        return {"message": "Fornecedor excluído com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao excluir fornecedor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.delete("/maintenance/{manutencao_id}")
def delete_maintenance(manutencao_id: int):
    """Exclui uma manutenção"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Verificar se existe
        cur.execute("SELECT id FROM manutencoes WHERE id = ?", (manutencao_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Manutenção não encontrada")
        
        # Excluir em cascata
        cur.execute("DELETE FROM checklists_manutencao WHERE manutencao_id = ?", (manutencao_id,))
        cur.execute("DELETE FROM agendamentos WHERE manutencao_id = ?", (manutencao_id,))
        cur.execute("DELETE FROM manutencoes WHERE id = ?", (manutencao_id,))
        
        conn.commit()
        conn.close()
        
        return {"message": "Manutenção excluída com sucesso"}
        
    except Exception as e:
        logger.error(f"Erro ao excluir manutenção: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.delete("/maintenance/checklist/{item_id}")
def delete_checklist_item(item_id: int):
    """Exclui item do checklist"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        cur.execute("DELETE FROM checklists_manutencao WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        
        return {"message": "Item do checklist excluído"}
        
    except Exception as e:
        logger.error(f"Erro ao excluir item do checklist: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# Inicializar gerenciador de configurações
config_manager = ConfigManager()

@app.get("/api/config")
def get_config():
    """Endpoint para obter configurações do sistema"""
    try:
        config = config_manager.load_config()
        return config
    except Exception as e:
        logger.error(f"Erro ao carregar configurações: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/api/config")
def save_config(config: dict):
    """Endpoint para salvar configurações do sistema"""
    try:
        success = config_manager.save_config(config)
        if success:
            # Atualizar agendamento se necessário
            update_scheduler_config(config)
            return {"detail": "Configurações salvas com sucesso"}
        else:
            raise HTTPException(status_code=500, detail="Erro ao salvar configurações")
    except Exception as e:
        logger.error(f"Erro ao salvar configurações: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/api/config/test")
def test_config_connection(config: dict):
    """Endpoint para testar conexão com a origem configurada"""
    try:
        importer = AdvancedImporter(config)
        result = importer.test_connection()
        importer.cleanup()
        
        if result["success"]:
            return {"detail": result["detail"]}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao testar conexão: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/api/config/import")
def import_with_config(config: dict):
    """Endpoint para importar usando configurações específicas"""
    try:
        importer = AdvancedImporter(config)
        temp_file = importer.download_file()
        
        if not temp_file:
            raise HTTPException(status_code=400, detail="Erro ao baixar arquivo")
        
        try:
            # Usar o arquivo temporário para importação
            global PLANILHA
            original_planilha = PLANILHA
            PLANILHA = temp_file
            
            # Executar importação
            importar_planilha()
            
            return {"detail": f"Importação realizada com sucesso usando {config['importType']}"}
        finally:
            # Restaurar configuração original e limpar
            PLANILHA = original_planilha
            importer.cleanup()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na importação com configuração: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

def update_scheduler_config(config):
    """Atualiza o agendamento baseado nas configurações"""
    try:
        if config.get("autoImport") and config.get("enabled"):
            # Remover job existente se houver
            try:
                scheduler.remove_job('auto_import')
            except:
                pass
            
            # Adicionar novo job
            import_time = f"{config.get('importHour', '10')}:{config.get('importMinute', '05')}"
            scheduler.add_job(
                importar_planilha,
                'cron',
                hour=int(config.get('importHour', 10)),
                minute=int(config.get('importMinute', 5)),
                id='auto_import',
                name='Importação Automática'
            )
            logger.info(f"Agendamento atualizado para {import_time}")
        else:
            # Remover job se desabilitado
            try:
                scheduler.remove_job('auto_import')
                logger.info("Importação automática desabilitada")
            except:
                pass
    except Exception as e:
        logger.error(f"Erro ao atualizar agendamento: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
