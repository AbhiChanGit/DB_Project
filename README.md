# DB_Project

## Project Overview

- **Frontend**: React/TypeScript
- **Backend**: Node.js/Express
- **Database**: PostgreSQL (managed via Prisma ORM)

It supports two user types:

### Customers

- Browse products
- Manage a shopping cart
- Place orders
- Maintain payment methods and addresses

### Staff

- Add/edit products
- Manage stock across warehouses
- Process orders

## Steps to Run the Website

### Backend

1. Navigate to the server directory:
`cd server`

2. Install dependencies:
`npm install`

3. Configure environment:
Create a .env file with the following content:
```
PORT=3006
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>"
JWT_SECRET="your_jwt_secret"
```

4. Apply database migrations & seed data:
```
npx prisma migrate deploy
npx prisma db seed
```

5. Start the backend
`npm run dev`

### Frontend

1. Navigate to the frontend directory:
`cd frontend`

2. Install dependencies:
`npm install`

3. Configure API URL:
Create a .env file with:
`REACT_APP_API_URL=http://localhost:3006`

4. Start the frontend:
`npm start`

5. Open in browser:
Visit [](http://localhost:3000)

## Database Details
All database models and seeding scripts reside in the prisma folder:

- Data models: server/prisma_ORM/schema.prisma
    - Defines models like User, Customer, Staff, Product, Warehouse, Stock, Order, etc.
- Seed data script: server/prisma_ORM/seed.ts
    -Populates initial database data.
- Migration history: prisma/migrations/
    -Stores database migration records.

> Note: Ensure your PostgreSQL server is running, and the DATABASE_URL in your .env matches its connection string before starting the backend.