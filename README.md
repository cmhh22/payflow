# PayFlow — Payment System (Backend Technical Test)

A small payment system exposing a RESTful API, built with **Node.js**,
**PostgreSQL**, and **Python**. The Node.js API persists data in PostgreSQL and
delegates payment authorization to a Python (FastAPI) microservice.

Un pequeño sistema de pagos que expone un API RESTful, construido con **Node.js**,
**PostgreSQL** y **Python**. El API de Node.js persiste los datos en PostgreSQL y
delega la autorización del pago a un microservicio en Python (FastAPI).

---

## Architecture / Arquitectura

```
				┌──────────────┐        POST /process        ┌────────────────────┐
				│   Node.js    │ ──────────────────────────► │  Python / FastAPI  │
Client →│   Express    │ ◄────── approved/rejected ── │  payment service   │
				│     API      │                              └────────────────────┘
				└──────┬───────┘
							 │ SQL
							 ▼
				┌──────────────┐
				│  PostgreSQL  │
				└──────────────┘
```

**Payment flow / Flujo de un pago (`POST /pagos`):**

1. Validate the request body / Validar el cuerpo de la petición.
2. Verify the user exists / Verificar que el usuario existe.
3. Verify the card exists and belongs to the user / Verificar que la tarjeta
	 existe y pertenece al usuario.
4. Call the Python service to authorize / Llamar al servicio Python para autorizar.
5. Persist the payment with its status / Guardar el pago con su estado.
6. Return the created payment / Devolver el pago creado.

---

## Tech stack / Tecnologías

- **API:** Node.js + Express + `pg` (node-postgres)
- **Payment service / Servicio de pagos:** Python + FastAPI + Uvicorn
- **Database / Base de datos:** PostgreSQL
- **Containerization (optional) / Contenedores (opcional):** Docker Compose

---

## Project structure / Estructura del proyecto

```
payflow/
├── api/                 # Node.js REST API
│   ├── src/
│   │   ├── config.js
│   │   ├── db.js
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── routes/      # usuarios, tarjetas, pagos
│   │   ├── services/    # paymentService (calls Python)
│   │   ├── middleware/  # error handling
│   │   └── utils/       # validation, errors
│   ├── scripts/         # db:init script
│   └── Dockerfile
├── payment-service/     # Python FastAPI service
│   ├── app/main.py
│   ├── requirements.txt
│   └── Dockerfile
├── db/                  # schema.sql + seed.sql
├── postman/             # Postman collection
├── docker-compose.yml
└── .env.example
```

---

## Prerequisites / Requisitos previos

**Native setup / Ejecución nativa:**
- Node.js 18+ (developed on Node 24)
- Python 3.10+
- PostgreSQL 15+

**Docker setup / Con Docker:**
- Docker Desktop with Docker Compose

---

## Environment variables / Variables de entorno

Copy `.env.example` to `.env` and adjust if needed.
Copia `.env.example` a `.env` y ajusta si es necesario.

```bash
cp .env.example .env
```

| Variable               | Description / Descripción            | Default      |
| ---------------------- | ------------------------------------ | ------------ |
| `POSTGRES_USER`        | Database user / Usuario de la BD     | `payflow`    |
| `POSTGRES_PASSWORD`    | Database password / Contraseña       | `payflow_pass` |
| `POSTGRES_DB`          | Database name / Nombre de la BD      | `payflow`    |
| `POSTGRES_HOST`        | Database host / Host de la BD        | `localhost`  |
| `POSTGRES_PORT`        | Database port / Puerto de la BD      | `5432`       |
| `API_PORT`             | Node API port / Puerto del API       | `3000`       |
| `PAYMENT_SERVICE_PORT` | Python service port / Puerto Python  | `8000`       |
| `PAYMENT_SERVICE_URL`  | Python service URL / URL del servicio| `http://localhost:8000` |

---

## Run with Docker / Ejecutar con Docker (Option A)

One command builds and starts the three services. PostgreSQL automatically loads
the schema and seed data on first start.
Un solo comando construye y arranca los tres servicios. PostgreSQL carga
automáticamente el esquema y los datos de prueba en el primer arranque.

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000`.
El API estará disponible en `http://localhost:3000`.

To stop / Para detener: `Ctrl + C`.
To reset the database / Para reiniciar la base de datos: `docker compose down -v`.

---

## Run natively / Ejecutar de forma nativa (Option B)

### 1. Create the database / Crear la base de datos

Using `psql` as the `postgres` superuser / Usando `psql` como superusuario `postgres`:

```sql
CREATE USER payflow WITH PASSWORD 'payflow_pass';
CREATE DATABASE payflow OWNER payflow;
```

### 2. Copy environment file / Copiar el archivo de entorno

```bash
cp .env.example .env
```

### 3. Initialize schema and seed / Inicializar esquema y datos

```bash
cd api
npm install
npm run db:init
```

This loads `db/schema.sql` and `db/seed.sql` into the database.
Esto carga `db/schema.sql` y `db/seed.sql` en la base de datos.

### 4. Start the Python payment service / Iniciar el servicio de pagos en Python

In a separate terminal / En una terminal aparte:

```bash
cd payment-service
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows (PowerShell):  venv\\Scripts\\Activate.ps1
# Windows (Git Bash):    source venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

### 5. Start the Node API / Iniciar el API de Node

In another terminal / En otra terminal:

```bash
cd api
npm start
```

The API will be available at `http://localhost:3000`.
El API estará disponible en `http://localhost:3000`.

---

## Endpoints

| Method | Path                       | Description / Descripción                         |
| ------ | -------------------------- | ------------------------------------------------- |
| GET    | `/health`                  | Health check                                      |
| POST   | `/usuarios`                | Create a user / Crear usuario                     |
| GET    | `/usuarios`                | List users / Listar usuarios                      |
| GET    | `/usuarios/:id`            | Get a user / Obtener un usuario                   |
| POST   | `/usuarios/:id/tarjetas`   | Register a card / Registrar tarjeta               |
| GET    | `/usuarios/:id/tarjetas`   | List a user's cards / Listar tarjetas del usuario |
| POST   | `/pagos`                   | Create a payment / Crear pago                     |
| GET    | `/usuarios/:id/pagos`      | Payment history / Historial de pagos              |

### Request body examples / Ejemplos de cuerpo

**Create user / Crear usuario** — `POST /usuarios`
```json
{ "nombre": "Grace Hopper", "email": "grace@example.com" }
```

**Register card / Registrar tarjeta** — `POST /usuarios/1/tarjetas`
```json
{ "titular": "Grace Hopper", "numero": "4111111111111111", "brand": "Visa", "exp_month": 11, "exp_year": 2030 }
```

**Create payment / Crear pago** — `POST /pagos`
```json
{ "usuario_id": 1, "tarjeta_id": 1, "monto": 99.50, "moneda": "USD" }
```

---

## Usage examples (curl) / Ejemplos de uso

```bash
# List users / Listar usuarios
curl http://localhost:3000/usuarios

# Create a payment / Crear un pago
curl -X POST http://localhost:3000/pagos \\
	-H "Content-Type: application/json" \\
	-d '{"usuario_id":1,"tarjeta_id":1,"monto":99.50}'

# Payment history / Historial de pagos
curl http://localhost:3000/usuarios/1/pagos
```

---

## Postman

Import `postman/payflow.postman_collection.json` into Postman. It includes all
endpoints grouped by resource, with a `baseUrl` collection variable
(`http://localhost:3000`).
Importa `postman/payflow.postman_collection.json` en Postman. Incluye todos los
endpoints agrupados por recurso, con una variable de colección `baseUrl`.

---

## Design decisions / Decisiones de diseño

- **Money as `NUMERIC(12,2)`** — never floating point, to avoid rounding errors.
	*Dinero como `NUMERIC(12,2)`, nunca punto flotante, para evitar errores de redondeo.*
- **Card masking** — only the last 4 digits are stored; the full number is never
	persisted (basic PCI-DSS hygiene, even with fictitious data).
	*Enmascaramiento de tarjetas: solo se guardan los últimos 4 dígitos.*
- **Centralized error handling** — consistent `{ "error", "code" }` shape with
	proper HTTP status codes (400/404/409/502/503).
	*Manejo de errores centralizado con forma consistente y códigos HTTP correctos.*
- **Card ownership check** — a payment can only use a card that belongs to the user.
	*Verificación de pertenencia: un pago solo puede usar una tarjeta del propio usuario.*
- **Resilient service call** — if the Python service is unreachable or times out,
	the API responds `503` instead of a generic `500`.
	*Llamada resiliente: si el servicio Python no responde, el API devuelve `503`.*
- **Layered structure** — config, db, routes, services, middleware, utils.
	*Estructura por capas.*

---

## Author / Autor

**Carlos Manuel Hernández** — [github.com/cmhh22](https://github.com/cmhh22)

