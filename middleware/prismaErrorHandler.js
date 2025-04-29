// middleware/prismaErrorHandler.js
const { Prisma } = require('@prisma/client');

module.exports = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({ error: 'Duplicate entry' });
      case 'P2025':
        return res.status(404).json({ error: 'Not found' });
      default:
        return res.status(400).json({ error: 'Database error', code: err.code });
    }
  }
  next(err);
};
