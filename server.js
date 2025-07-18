require('./index.js')
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Use the shared Prisma client
const prisma = require('./prismaClient');

// Prisma error handler
const prismaErrorHandler = require('./server/src/middleware/prismaErrorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Mount your routes
app.use('/auth',      require('./server/src/routes/jwtAuth'));
app.use('/customers', require('./server/src/routes/customers'));
app.use('/staffs',    require('./server/src/routes/staffs'));

// Prisma-specific DB errors
app.use(prismaErrorHandler);

// Global fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3006;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received: closing HTTP server');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
  });
});
