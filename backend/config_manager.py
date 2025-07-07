import json
import os
import base64
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import logging

logger = logging.getLogger(__name__)

class ConfigManager:
    def __init__(self, config_file="config.json"):
        self.config_file = Path(config_file)
        self.key_file = Path("config.key")
        self._cipher = None
        self._load_or_create_key()
    
    def _load_or_create_key(self):
        """Carrega ou cria uma chave de criptografia"""
        if self.key_file.exists():
            with open(self.key_file, 'rb') as f:
                key = f.read()
        else:
            # Criar nova chave
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
        
        self._cipher = Fernet(key)
    
    def _encrypt_password(self, password):
        """Criptografa uma senha"""
        if not password:
            return ""
        return self._cipher.encrypt(password.encode()).decode()
    
    def _decrypt_password(self, encrypted_password):
        """Descriptografa uma senha"""
        if not encrypted_password:
            return ""
        try:
            return self._cipher.decrypt(encrypted_password.encode()).decode()
        except Exception as e:
            logger.error(f"Erro ao descriptografar senha: {e}")
            return ""
    
    def load_config(self):
        """Carrega as configurações do arquivo"""
        default_config = {
            "importType": "local",
            "filePath": "",
            "username": "",
            "password": "",
            "autoImport": True,
            "importHour": "10",
            "importMinute": "05",
            "enabled": True
        }
        
        if not self.config_file.exists():
            return default_config
        
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Descriptografar senha se existir
            if "password" in config:
                config["password"] = self._decrypt_password(config["password"])
            
            # Mesclar com configurações padrão
            for key, value in default_config.items():
                if key not in config:
                    config[key] = value
            
            return config
        except Exception as e:
            logger.error(f"Erro ao carregar configurações: {e}")
            return default_config
    
    def save_config(self, config):
        """Salva as configurações no arquivo"""
        try:
            # Criar cópia para não modificar o original
            config_to_save = config.copy()
            
            # Criptografar senha se existir
            if "password" in config_to_save:
                config_to_save["password"] = self._encrypt_password(config_to_save["password"])
            
            # Garantir que o diretório existe
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config_to_save, f, indent=2, ensure_ascii=False)
            
            logger.info("Configurações salvas com sucesso")
            return True
        except Exception as e:
            logger.error(f"Erro ao salvar configurações: {e}")
            return False
    
    def get_import_path(self):
        """Retorna o caminho de importação configurado"""
        config = self.load_config()
        return config.get("filePath", "")
    
    def get_import_time(self):
        """Retorna o horário de importação configurado"""
        config = self.load_config()
        return f"{config.get('importHour', '10')}:{config.get('importMinute', '05')}"
    
    def is_auto_import_enabled(self):
        """Verifica se a importação automática está habilitada"""
        config = self.load_config()
        return config.get("autoImport", True) and config.get("enabled", True) 