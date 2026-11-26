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

## 4. Producción (CORS en el backend)
En `Program.cs` del backend agrega antes de `builder.Build()`:
```csharp
builder.Services.AddCors(o => o.AddPolicy("Frontend", p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173" })
    .AllowAnyHeader().AllowAnyMethod()));
```
y justo antes de `app.UseAuthentication();`:
```csharp
app.UseCors("Frontend");
```
Luego define `VITE_API_URL=https://tu-api.com` al compilar (`npm run build`) y despliega `dist/` en Vercel o Netlify.

## Estructura
`src/api.js` concentra todas las llamadas al backend. `src/pages/` tiene las pantallas y `src/components/` el mapa y las tarjetas.
