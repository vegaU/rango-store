# Rango Store

## PostgREST

1. Crea un archivo `.env` a partir de `.env.example`.
2. Define `VITE_POSTGREST_URL` con la URL base de tu servicio PostgREST.
3. Si tu API usa un schema distinto de `public`, ajusta `VITE_POSTGREST_SCHEMA`.
4. Si el gateway exige API key o JWT estatico, carga `VITE_POSTGREST_API_KEY`.
5. Si el recurso no se llama `products`, cambia `VITE_POSTGREST_PRODUCTS_RESOURCE`.

La ruta `/stock` ya intenta leer `id,name,sku,category,brand,stock,price,location` desde PostgREST. Si la conexion falla o faltan variables, la app mantiene datos de ejemplo para no romper la interfaz.

## NestJS

El backend NestJS vive en `backend/`.

1. Crea `backend/.env` a partir de `backend/.env.example`.
2. Ajusta `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y deja `DB_NAME=rango_store`.
3. Instala dependencias del frontend con `npm install`.
4. Instala dependencias del backend con `npm --prefix backend install`.
5. Levanta el frontend con `npm run dev`.
6. Levanta el backend con `npm run backend:dev`.

El backend expone `GET http://localhost:3001/api/health`, usa TypeORM para conectarse a PostgreSQL y ya tiene CORS habilitado para `http://localhost:5173`.
