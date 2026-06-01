# Inventory & Order Management System

A full-stack web application for managing products, customers, orders, and inventory tracking.

## Live URLs

- **Frontend:** https://frontend-lilac-eta-75.vercel.app
- **Backend API:** https://inventory-backend-stg1.onrender.com
- **API Docs (Swagger):** https://inventory-backend-stg1.onrender.com/docs
- **Docker Hub Image:** https://hub.docker.com/r/malika12kaur/inventory-backend

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | FastAPI (Python 3.11), SQLAlchemy, Pydantic |
| Database | PostgreSQL (Neon.tech) |
| Containerization | Docker, Docker Compose |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Features

- **Products** — Add, edit, delete products with unique SKU enforcement
- **Customers** — Manage customers with unique email enforcement
- **Orders** — Place orders with automatic stock validation and reduction
- **Inventory Tracking** — Real-time stock status (In Stock / Low Stock / Out of Stock)
- **Order Status** — Update order status (Pending → Confirmed → Shipped → Delivered / Cancelled)
- **Stock Restoration** — Stock automatically restored when order is cancelled or deleted
- **Dashboard** — Overview of total products, customers, orders, and revenue

## Business Rules

- Product SKUs must be unique
- Customer emails must be unique
- Orders cannot be placed if stock is insufficient
- Stock is automatically reduced when an order is placed
- Stock is restored when an order is cancelled or deleted

## Project Structure

```
inventory-management/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, CORS, router setup
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── database.py    # DB connection
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       └── orders.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/         # Dashboard, Products, Customers, Orders
│   │   ├── components/    # Navbar, Toast
│   │   └── api/           # Axios API client
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Run Locally with Docker

```bash
# Clone the repo
git clone https://github.com/malika-dev-del/inventory-management.git
cd inventory-management

# Copy env file and set your database credentials
cp .env.example .env

# Build and start all services
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `VITE_API_URL` | Backend API base URL (frontend) |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products/ | List all products |
| POST | /api/products/ | Create a product |
| PUT | /api/products/{id} | Update a product |
| DELETE | /api/products/{id} | Delete a product |
| GET | /api/customers/ | List all customers |
| POST | /api/customers/ | Create a customer |
| PUT | /api/customers/{id} | Update a customer |
| DELETE | /api/customers/{id} | Delete a customer |
| GET | /api/orders/ | List all orders |
| POST | /api/orders/ | Place an order |
| PATCH | /api/orders/{id}/status | Update order status |
| DELETE | /api/orders/{id} | Delete an order |
