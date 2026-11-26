# EduMap Frontend

Interfaz web para el backend **EDUMAP-HEXAGONAL** (.NET). React + Vite + Leaflet.

Qué incluye: mapa con filtros (categoría, distrito, gestión, pensión), ficha de institución con reseñas, registro e inicio de sesión (JWT), y favoritos.

## 1. Levantar el backend
```bash
git clone https://github.com/georkybejar-hub/EDUMAP-HEXAGONAL.git
cd EDUMAP-HEXAGONAL/EdumapHexagonal.Api
# copia appsettings.Example.json a appsettings.json y pon tu cadena de conexión y Jwt:Key (32+ caracteres)
dotnet run --launch-profile https      # queda en https://localhost:7003
```

## 2. Levantar el frontend
```bash
cd edumap-frontend
cp .env.example .env
npm install
npm run dev                            # http://localhost:5173
```
En desarrollo, Vite redirige `/api` al backend, así que **no necesitas tocar CORS**. Si usas el perfil `http`, cambia `VITE_API_PROXY` a `http://localhost:5066`.
Si el backend no tiene datos, el mapa saldrá vacío: la lista sale de la vista `institution-search-views`.

## 3. Subirlo a tu GitHub (MrCloud18)
Crea en github.com un repositorio vacío llamado `EDUMAP-FRONTEND` (sin README) y luego:
```bash
git init
git add .
git commit -m "feat: frontend inicial de EduMap"
git branch -M main
git remote add origin https://github.com/MrCloud18/EDUMAP-FRONTEND.git
git push -u origin main
```

## 4. Producción en Vercel + Render

El backend necesita el `Dockerfile`, `.dockerignore` y `Program.cs` preparados
para Render, que incluyen la política CORS `VercelFrontend` y `/health`.

1. Despliega el backend en Render con sus variables de entorno de conexión
   a Supabase y JWT. Comprueba `https://TU-SERVICIO.onrender.com/health`.
2. En Vercel (frontend), configura `VITE_API_URL` con la URL pública del
   backend, por ejemplo `https://TU-SERVICIO.onrender.com` (sin barra final).
3. En Render (backend), configura `Cors__AllowedOrigins__0` con la URL real
   de Vercel, por ejemplo `https://TU-SITIO.vercel.app` (sin barra final).
4. Vuelve a desplegar ambos servicios después de guardar las variables.

El frontend consume directamente la API de Render. El proxy de Vite se usa
solo durante el desarrollo local; el `vercel.json` conserva únicamente la
reescritura necesaria para navegar por las rutas de React.

La consulta del directorio usa `pageSize=0`, opción compatible con el código
actual del backend para obtener todas las instituciones. En el buscador,
pensiones de 0 procedentes de la vista sin ofertas se tratan como «no registrada».

## Estructura
`src/api.js` concentra todas las llamadas al backend. `src/pages/` tiene las pantallas y `src/components/` el mapa y las tarjetas.
