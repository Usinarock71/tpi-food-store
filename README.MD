# Food Store - Trabajo Practico Integrador (Programacion 4)

Aplicacion web Full Stack para la gestion de pedidos de comida, catalogo de productos y administracion operativa, desarrollada con **FastAPI + SQLModel + PostgreSQL** en el backend y **React 19 + TypeScript + Vite + Tailwind CSS v4** en el frontend.

**Link al Video Presentacion: https://youtu.be/u6EQiXPlF2o**
**Link al Repositorio (Github): https://github.com/Usinarock71/tpi-food-store**

---

## 1. Estructura del Proyecto

```text
TPI-FoodStore/
├── backend/                  # API REST en FastAPI + SQLModel + Unit of Work
│   ├── app/
│   │   ├── core/             # Configuración, BD, seguridad JWT, dependencias, UoW y BaseRepository
│   │   ├── db/               # Script de carga inicial idempotente (seed.py)
│   │   └── modules/          # Módulos de dominio: auth, usuarios, categorias, productos, pedidos
│   ├── .env.example          # Plantilla de variables de entorno del backend
│   └── requirements.txt      # Dependencias Python fijadas
├── frontend/                 # SPA en React + TypeScript (arquitectura por features)
│   ├── src/
│   │   ├── features/         # auth, usuarios, categorias, productos, pedidos
│   │   ├── routes/           # Enrutador y ProtectedRoute por sesión/rol
│   │   ├── shared/           # Axios (withCredentials), QueryClient, UI y layout
│   │   └── store/            # Estado global con Zustand + persist (authStore, cartStore)
│   └── .env.example          # Plantilla de variables de entorno del frontend
└── README.md
```

---

## 2. Requisitos Previos

* **Python**: 3.11 o superior (probado en 3.12 / 3.14).
* **PostgreSQL**: 14 o superior (con una base de datos vacía creada, por ejemplo `foodstore_db`).
* **Node.js**: 20+ y **pnpm**.

---

## 3. Instalación y Ejecución

### A. Backend (`backend/`)

1. Crear la base de datos `foodstore_db` en PostgreSQL.
2. Configurar las variables de entorno copiando `.env.example` a `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
   *(Ajustar credenciales de `DATABASE_URL` si difieren de `postgres:admin@localhost:5432/foodstore_db`)*.
3. Crear entorno virtual, instalar dependencias y ejecutar el seed inicial:
   ```bash
   python -m venv .venv
   # En Windows:
   .\.venv\Scripts\activate
   # En Linux/macOS:
   # source .venv/bin/activate

   pip install -r requirements.txt
   python -m app.db.seed
   ```
4. Levantar el servidor de desarrollo:
   ```bash
   uvicorn app.main:app --reload
   ```
   * API disponible en: `http://localhost:8000/api/v1`
   * Documentación interactiva (Swagger): `http://localhost:8000/docs`

### B. Frontend (`frontend/`)

1. En una nueva terminal, ir a `frontend/` y configurar `.env`:
   ```bash
   cd frontend
   cp .env.example .env
   ```
2. Instalar dependencias y levantar la aplicación:
   ```bash
   pnpm install
   pnpm dev
   ```
   * Aplicación disponible en: `http://localhost:5173`

---

## 4. Credenciales de Prueba (Seed)

El comando `python -m app.db.seed` es idempotente y carga:
* **Usuario Administrador**:
  * **Usuario**: `admin`
  * **Contraseña**: `Admin1234!`
* **Datos iniciales**: 3 categorías (`Hamburguesas`, `Pizzas`, `Bebidas`) y 8 productos activos con stock inicial.
* Los clientes pueden registrarse libremente desde `/register` (se crean con rol `"user"`).

---

## 5. Arquitectura y Reglas de Negocio Implementadas

* **Autenticación Stateless con Cookies HttpOnly**: El token JWT se emite en `POST /api/v1/auth/token` mediante cookie `HttpOnly` (`SameSite=Lax`), sin almacenamiento de tokens en `localStorage` ni `sessionStorage`.
* **Unit of Work (`UnitOfWork`)**: Toda operación transaccional gestiona `commit()` y `rollback()` de forma atómica en `__exit__`.
* **Reglas de Negocio de Pedidos**:
  * **RN-01**: No se permiten productos duplicados en los ítems de un mismo pedido.
  * **RN-02**: Creación atómica: verifica disponibilidad y stock, descuenta inventario y crea cabecera + líneas en una única transacción.
  * **RN-03**: La cancelación (por el cliente en `PENDIENTE` o por el admin en `PENDIENTE`/`EN_PREPARACION`) restituye el stock automáticamente.
  * **RN-04**: Máquina de estados estricta: `PENDIENTE` → `EN_PREPARACION` → `ENTREGADO` (o `CANCELADO` desde estados no finales).
  * **RN-05**: Inmutabilidad histórica: `DetallePedido` guarda una copia de `nombre_producto` y `precio_unitario` al momento de la compra.
  * **RN-06**: Aislamiento de datos: los usuarios con rol `"user"` solo visualizan y cancelan sus propios pedidos.