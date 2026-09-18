# Despliegue Docker de tuDía

El proyecto está dividido en tres servicios independientes:

- **MySQL**: base de datos persistente.
- **Backend**: API Spring Boot, puerto `8080`.
- **Frontend**: aplicación Next.js, puerto `3000`.

## Ejecutarlo localmente

1. Copiá `.env.docker.example` como `.env` y reemplazá las claves de ejemplo.
2. Desde la raíz del proyecto ejecutá:

   ```powershell
   docker compose up --build
   ```

3. Abrí `http://localhost:3000`.

Dentro de Docker, el frontend llega al backend con `http://backend:8080` y el backend llega a MySQL con `mysql:3306`. Esos nombres solo aplican al `docker-compose.yml` local.

Para detener los contenedores conservando los datos:

```powershell
docker compose down
```

Para eliminar también los datos persistidos:

```powershell
docker compose down -v
```

## Desplegar los tres servicios por separado en Dokploy

Creá los servicios en este orden: **MySQL**, **backend** y **frontend**.

### 1. MySQL

Creá una base MySQL 8.4 y definí `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_ROOT_PASSWORD`. Conservá el volumen de datos que crea Dokploy.

### 2. Backend

Creá una aplicación Dockerfile con:

```text
Dockerfile path: backend/Dockerfile
Docker context path: backend
Puerto: 8080
```

En sus variables de entorno configurá `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `UPLOAD_DIR`, `CORS_ALLOWED_ORIGINS` y, opcionalmente, las variables `SEED_*`. `DB_URL` debe usar el **Internal Host** de MySQL y llevar `allowPublicKeyRetrieval=true`.

Ejemplo de formato:

```text
DB_URL=jdbc:mysql://HOST_INTERNO_MYSQL:3306/NOMBRE_BASE?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Argentina/Buenos_Aires
```

### 3. Frontend

Creá otra aplicación Dockerfile con:

```text
Dockerfile path: frontend/Dockerfile
Docker context path: frontend
Puerto: 3000
```

En **Build Time Arguments** agregá:

```text
BACKEND_URL=http://HOST_INTERNO_BACKEND:8080
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave
NEXT_PUBLIC_APP_URL=https://tu-dominio-publico
```

`BACKEND_URL` se requiere al compilar el frontend; si falta, la compilación se detiene con un error claro. `NEXT_PUBLIC_APP_URL` debe ser el dominio público final del frontend, porque se utiliza en la imagen de vista previa que WhatsApp lee. Para identificar el host interno del backend, abrí su configuración avanzada en Dokploy y consultá la URL interna que aparece en la configuración de Traefik.
