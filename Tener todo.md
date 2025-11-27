## **🚀 Guía de Puesta en Marcha del Proyecto**

Esta guía te permitirá clonar y ejecutar el proyecto de "Alquiler de Vehículos" en tu máquina local.

El proyecto utiliza **Docker** para gestionar la base de datos (MySQL) y la aplicación (FastAPI), y un **entorno virtual local** (`venv`) para el autocompletado en tu editor de código.

### **📋 Prerrequisitos (Instalación Única)**

Antes de empezar, asegurate de tener instaladas las siguientes herramientas en tu sistema:

1. **Git:** Para clonar el repositorio.  
2. **Python 3.10+:** Para crear el entorno virtual local.  
3. **Docker Desktop:** Es el motor que correrá nuestros contenedores (la API y la BD).  
   * **Importante:** Asegúrate de que la aplicación Docker Desktop esté **abierta y corriendo** en tu PC antes de empezar.

---

### **1\. Clonar y Configurar (La Primera Vez)**

Este proceso solo se hace la primera vez que bajás el proyecto.

#### **Paso 1: Clonar el Repositorio**

Abrí tu terminal y cloná el proyecto. Reemplazá la URL por la de tu repositorio:

git clone https://github.com/tu-usuario/G36-DAO-sistema-alquiler-vehiculos.git

#### **Paso 2: Levantar los Servicios (¡La Magia de Docker\!)**

Este es el paso más importante. Levantará la API de FastAPI y la base de datos MySQL.

\# Estando en la raíz del proyecto (donde está el docker-compose.yml)  
docker-compose up \--build

* `--build`: Fuerza a Docker a (re)construir tu imagen de `backend`, instalando todas las librerías del `requirements.txt`.  
* Verás un montón de logs en tu terminal. Esperá a que se estabilice. Deberías ver mensajes de **MySQL** (`...ready for connections.`) y de **Uvicorn** (`...Application startup complete.`).  
* **Probá la API:** Andá a `http://localhost:8000/docs` en tu navegador.  
* **Conectate a la BD:** Podés usar DBeaver (o similar) con los datos del `docker-compose.yml` (host: `localhost`, user: `root`, pass: `mi_clave_secreta`, db: `alquileres_db`)..

#### **Paso 3: Configurar el Entorno Virtual Local (Para tu IDE)**

Los servicios ya están corriendo en Docker, pero tu VS Code local no "sabe" qué librerías tenés. Este paso es para **ayudar a tu editor** con el autocompletado.

1. **Abrí una NUEVA terminal** (dejá la de `docker-compose` corriendo).  
2. **Creá el entorno virtual:**  
   \# Se creará una carpeta .venv (ignorada por Git)   
   python \-m venv .venv  
3. **Activá el entorno:**  
   \#En pycharm me funciono asi  
   .venv\\Scripts\\Activate.ps1  
   \# En Windows (PowerShell/CMD)

.\\.venv\\Scripts\\activate

\# En macOS/Linux  
source .venv/bin/activate

4. **Instalá las librerías (localmente): *Recordá que tu `requirements.txt` está dentro de `backend/`.***  
   *pip install \-r backend/requirements.txt*  
5. **Configurá VS Code:**  
   1. Abrí la Paleta de Comandos (`Ctrl+Shift+P`).  
   2. Buscá y seleccioná `Python: Select Interpreter`.  
   3. Elegí el intérprete que dice `('.venv': venv)`.

Ahora tu VS Code tendrá autocompletado y no te marcará falsos errores.

### **2\. 💻 Tu Flujo de Trabajo Diario**

A partir de ahora, cada vez que te sientes a programar, solo tenés que hacer esto:

1. #### **Asegúrate** de que la aplicación **Docker Desktop** esté abierta.

2. #### **Terminal 1:** Andá a la raíz del proyecto y levantá los servicios:    docker-compose up

3. #### **Terminal 2:** Andá a la raíz del proyecto y activá tu `venv` para los comandos de Git:    .\\.venv\\Scripts\\activate

4. **VS Code:** Abrí el proyecto. Asegúrate de que esté seleccionado el intérprete de `.venv`.

5. **¡Programá\!**

   Modificá cualquier archivo `.py` en la carpeta `backend/`.  
   Guardá el archivo.  
   La **Terminal 1** (la de Docker) detectará el cambio y reiniciará la API automáticamente (gracias a `uvicorn --reload`).  
   Probá tus cambios en [`http://localhost:8000/docs`](http://localhost:8000/docs).

6. Al terminar:  
   En la **Terminal 2**, hacé tus commits: `git add .`, `git commit ...`, `git push`.  
   En la **Terminal 1**, presioná `Ctrl+C` para detener los servicios.  
   (Opcional) Ejecutá `docker-compose down` para limpiar y apagar todo.

