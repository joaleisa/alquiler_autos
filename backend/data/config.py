import os
from pydantic_settings import BaseSettings


#Aca se setean todos los datos necesarios para conectarse a la base de datos.
# El docker_compose utiliza el .env para generar la misma conexión.

class Settings(BaseSettings):
    DB_USER: str = "root"
    DB_PASSWORD: str = 'DAO20"%'
    DB_HOST: str = "34.39.194.31"
    DB_PORT: int = 3306
    DB_NAME: str = "alquiler_bd"

    # Construye la URL de conexión automáticamente
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"  # Busca un archivo .env si existe


settings = Settings()