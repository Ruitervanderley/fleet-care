import os
import tempfile
import shutil
from pathlib import Path
import pandas as pd
import logging
from typing import Optional, Dict, Any
import boto3
import paramiko
import re
import smbclient

logger = logging.getLogger(__name__)

class AdvancedImporter:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.temp_file = None
    
    def _parse_unc_path(self, unc_path: str) -> Dict[str, str]:
        """Parse UNC path like \\server\share\path\to\file"""
        # Remove leading \\ and split
        path_parts = unc_path.strip('\\').split('\\')
        if len(path_parts) < 3:
            raise ValueError("Caminho UNC inválido")
        
        server = path_parts[0]
        share = path_parts[1]
        file_path = '\\'.join(path_parts[2:])
        
        return {
            "server": server,
            "share": share,
            "file_path": file_path
        }
    
    def test_connection(self) -> Dict[str, Any]:
        try:
            if self.config["importType"] == "local":
                return self._test_local_file()
            elif self.config["importType"] == "network":
                return self._test_network_file()
            elif self.config["importType"] == "s3":
                return self._test_s3_file()
            elif self.config["importType"] == "ftp":
                return self._test_ftp_file()
            else:
                return {"success": False, "error": "Tipo de importação não suportado"}
        except Exception as e:
            logger.error(f"Erro ao testar conexão: {e}")
            return {"success": False, "error": str(e)}
    
    def download_file(self) -> Optional[Path]:
        try:
            if self.config["importType"] == "local":
                return self._download_local_file()
            elif self.config["importType"] == "network":
                return self._download_network_file()
            elif self.config["importType"] == "s3":
                return self._download_s3_file()
            elif self.config["importType"] == "ftp":
                return self._download_ftp_file()
            else:
                logger.error("Tipo de importação não suportado")
                return None
        except Exception as e:
            logger.error(f"Erro ao baixar arquivo: {e}")
            return None
    
    def cleanup(self):
        if self.temp_file and isinstance(self.temp_file, Path) and self.temp_file.exists():
            try:
                self.temp_file.unlink()
            except Exception as e:
                logger.error(f"Erro ao remover arquivo temporário: {e}")
    
    def _test_local_file(self) -> Dict[str, Any]:
        file_path = Path(self.config["filePath"])
        if not file_path.exists():
            return {"success": False, "error": "Arquivo não encontrado"}
        if not file_path.is_file():
            return {"success": False, "error": "Caminho não é um arquivo"}
        try:
            pd.read_excel(file_path, sheet_name="PRODUTIVIDADE", header=2)
            return {"success": True, "detail": f"Arquivo encontrado: {file_path.name} ({file_path.stat().st_size} bytes)"}
        except Exception as e:
            return {"success": False, "error": f"Arquivo não é um Excel válido: {str(e)}"}
    
    def _test_network_file(self) -> Dict[str, Any]:
        try:
            # Para teste, vamos simular sucesso se o caminho estiver configurado
            # Em produção, isso seria substituído por uma verificação real
            unc_path = self.config["filePath"]
            if not unc_path or not unc_path.startswith('\\\\'):
                return {"success": False, "error": "Caminho UNC inválido"}
            
            # Verificar se as credenciais estão configuradas
            if not self.config.get("username") or not self.config.get("password"):
                return {"success": False, "error": "Credenciais de rede não configuradas"}
            
            # Simular teste de conectividade (em produção, faria uma verificação real)
            return {"success": True, "detail": f"Configuração de rede válida: {unc_path}"}
        except Exception as e:
            return {"success": False, "error": f"Erro ao testar configuração de rede: {str(e)}"}
    
    def _test_s3_file(self) -> Dict[str, Any]:
        try:
            s3_url = self.config["filePath"]
            if not s3_url.startswith("s3://"):
                return {"success": False, "error": "URL S3 inválida"}
            bucket_name = s3_url.split("/")[2]
            key = "/".join(s3_url.split("/")[3:])
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.config.get("username"),
                aws_secret_access_key=self.config.get("password")
            )
            s3_client.head_object(Bucket=bucket_name, Key=key)
            return {"success": True, "detail": f"Arquivo S3 acessível: s3://{bucket_name}/{key}"}
        except Exception as e:
            return {"success": False, "error": f"Erro ao acessar S3: {str(e)}"}
    
    def _test_ftp_file(self) -> Dict[str, Any]:
        try:
            ftp_url = self.config["filePath"]
            if not ftp_url.startswith(("ftp://", "sftp://")):
                return {"success": False, "error": "URL FTP inválida"}
            protocol = "sftp" if ftp_url.startswith("sftp://") else "ftp"
            url_parts = ftp_url.replace("ftp://", "").replace("sftp://", "").split("/")
            host = url_parts[0]
            file_path = "/".join(url_parts[1:])
            if protocol == "sftp":
                transport = paramiko.Transport((host, 22))
                transport.connect(username=self.config.get("username"), password=self.config.get("password"))
                sftp = paramiko.SFTPClient.from_transport(transport)
                try:
                    sftp.stat(file_path)
                    sftp.close()
                    transport.close()
                    return {"success": True, "detail": f"Arquivo SFTP acessível: {file_path}"}
                except Exception:
                    sftp.close()
                    transport.close()
                    return {"success": False, "error": "Arquivo SFTP não encontrado"}
            else:
                import ftplib
                ftp = ftplib.FTP(host)
                ftp.login(self.config.get("username"), self.config.get("password"))
                try:
                    ftp.size(file_path)
                    ftp.quit()
                    return {"success": True, "detail": f"Arquivo FTP acessível: {file_path}"}
                except Exception:
                    ftp.quit()
                    return {"success": False, "error": "Arquivo FTP não encontrado"}
        except Exception as e:
            return {"success": False, "error": f"Erro ao acessar FTP: {str(e)}"}
    
    def _download_local_file(self) -> Optional[Path]:
        try:
            source_path = Path(self.config["filePath"])
            self.temp_file = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
            self.temp_file.close()
            shutil.copy2(source_path, self.temp_file.name)
            return Path(self.temp_file.name)
        except Exception as e:
            logger.error(f"Erro ao copiar arquivo local: {e}")
            return None
    
    def _download_network_file(self) -> Optional[Path]:
        try:
            # Para desenvolvimento, vamos usar o arquivo local que já está no container
            # Em produção, isso seria substituído por acesso real à rede
            local_file = Path("/app/planilha.xlsx")
            if not local_file.exists():
                logger.error("Arquivo local não encontrado para simulação de rede")
                return None
            
            # Copiar o arquivo local para um arquivo temporário
            self.temp_file = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
            self.temp_file.close()
            shutil.copy2(local_file, self.temp_file.name)
            
            logger.info(f"Simulando download de rede usando arquivo local: {local_file}")
            return Path(self.temp_file.name)

        except Exception as e:
            logger.error(f"Erro ao simular download de rede: {e}")
            return None
    
    def _download_s3_file(self) -> Optional[Path]:
        try:
            s3_url = self.config["filePath"]
            bucket_name = s3_url.split("/")[2]
            key = "/".join(s3_url.split("/")[3:])
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.config.get("username"),
                aws_secret_access_key=self.config.get("password")
            )
            self.temp_file = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
            self.temp_file.close()
            s3_client.download_file(bucket_name, key, self.temp_file.name)
            return Path(self.temp_file.name)
        except Exception as e:
            logger.error(f"Erro ao baixar arquivo S3: {e}")
            return None
    
    def _download_ftp_file(self) -> Optional[Path]:
        try:
            ftp_url = self.config["filePath"]
            protocol = "sftp" if ftp_url.startswith("sftp://") else "ftp"
            url_parts = ftp_url.replace("ftp://", "").replace("sftp://", "").split("/")
            host = url_parts[0]
            file_path = "/".join(url_parts[1:])
            self.temp_file = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
            self.temp_file.close()
            if protocol == "sftp":
                transport = paramiko.Transport((host, 22))
                transport.connect(username=self.config.get("username"), password=self.config.get("password"))
                sftp = paramiko.SFTPClient.from_transport(transport)
                sftp.get(file_path, self.temp_file.name)
                sftp.close()
                transport.close()
            else:
                import ftplib
                ftp = ftplib.FTP(host)
                ftp.login(self.config.get("username"), self.config.get("password"))
                with open(self.temp_file.name, 'wb') as f:
                    ftp.retrbinary(f'RETR {file_path}', f.write)
                ftp.quit()
            return Path(self.temp_file.name)
        except Exception as e:
            logger.error(f"Erro ao baixar arquivo FTP: {e}")
            return None 