# TicketManager — Prueba Técnica Full Stack

Aplicación full stack para gestión de tickets de soporte con autenticación JWT y control de acceso basado en roles.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core |
| Base de datos | SQL Server |
| Autenticación | JWT (HMAC-SHA256) |
| Frontend | Next.js + React |
| Gráficos | Recharts |
| Contenedores | Docker + Docker Compose |

---

## Instrucciones para ejecutar el proyecto

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

### Levantar con un solo comando

```bash
docker-compose up -d --build
```

Esto levanta tres contenedores automáticamente:
- **db** → SQL Server en el puerto `1433`
- **backend** → ASP.NET Core API en el puerto `7002`
- **frontend** → Next.js en el puerto `3000`

Las migraciones de la base de datos se ejecutan automáticamente al iniciar la API.

### Acceder a la aplicación

| Servicio | URL |
|---|---|
| Portal Web | http://localhost:3000 |
| API (Swagger) | http://localhost:7002/swagger |

### Credenciales del Super Admin (creado por defecto)

```
Email:    admin@admin.com
Contraseña: Admin123!
```

### Detener la aplicación

```bash
docker-compose down
```

---

## Decisiones técnicas

### Backend

- **Service Layer Pattern**: Los controladores solo orquestan, toda la lógica de negocio vive en servicios (`ITicketService`, `IAuthService`, `ITokenService`). Esto facilita testing y mantenimiento.
- **DTOs en lugar de modelos directos**: Los endpoints reciben y devuelven DTOs, nunca las entidades de base de datos. Esto previene over-posting y expone solo lo necesario.
- **BCrypt para contraseñas**: Hashing con salt automático. El texto plano nunca toca la base de datos.
- **JWT con Claims tipados**: Los claims de `userId` y `role` se leen desde el token mediante una extensión de `ClaimsPrincipal`, de modo que es imposible que un cliente manipule su propia identidad en el body.
- **Seeder automático de Admin**: Al iniciar, la API verifica si existe un usuario Admin y lo crea si no hay ninguno, garantizando que el sistema siempre tiene acceso administrativo sin scripts manuales.
- **Paginación en la API**: `GET /tickets` soporta `?page=&pageSize=` para escalar a grandes volúmenes de datos.
- **Endpoint de stats separado**: `GET /tickets/stats` hace `COUNT` directos en la BD (sin traer datos al servidor) para alimentar el gráfico de forma eficiente.

### Frontend

- **`apiFetch` centralizado**: Un único punto de salida para todas las llamadas HTTP que adjunta el JWT automáticamente e intercepta los `401` para limpiar la sesión y redirigir al login.
- **Decodificación del JWT en cliente**: El rol del usuario se extrae del token con `jwt-decode` sin llamada extra al backend.
- **Gráfico de datos reales**: El Pie Chart usa el endpoint `/tickets/stats` que devuelve los totales globales, no los datos paginados de la vista actual.

---

## Qué mejoraría con más tiempo

1. **Testing automatizado**: Agregar tests unitarios a los servicios con xUnit/Moq en el backend, y tests de integración con Playwright en el frontend.
2. **Refresh Tokens**: Actualmente el JWT expira a las 2 horas y el usuario es expulsado sin aviso. Un sistema de refresh tokens mejoraría la experiencia.
3. **Gestión de secretos**: Usar `.env` + `.gitignore` o un servicio como Azure Key Vault para que las credenciales no queden en `docker-compose.yml`.
4. **Roles expandibles**: Convertir el rol en un sistema más granular (permisos individuales) en lugar de un enum binario User/Admin.
5. **Notificaciones en tiempo real**: WebSockets o Server-Sent Events para que el Admin vea tickets nuevos sin refrescar la página.
6. **Filtros y búsqueda**: Permitir filtrar la lista de tickets por estado, fecha o usuario desde la interfaz.
7. **CI/CD**: Pipeline con GitHub Actions que compile, testee y valide el build antes de cada merge.
