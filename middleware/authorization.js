// middleware/authorization.js
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    const token = req.header('token');
    if (!token) {
      return res.status(403).json({ status: 'fail', message: 'Authorization denied' });
    }

    // 1. Verify JWT
    const payload = jwt.verify(token, process.env.jwtSecret);
    const userId  = payload.user_id;

    // 2. Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(403).json({ status: 'fail', message: 'User not found' });
    }
    req.user = user;

    // 3. If customer, load their customer record
    if (user.user_type === 'customer') {
      const customer = await prisma.customer.findUnique({
        where: { user_id: userId }
      });
      if (!customer) {
        return res.status(404).json({ status: 'fail', message: 'Customer profile missing' });
      }
      req.customer = customer;
    }

    // 4. If staff, load their staff record
    if (user.user_type === 'staff') {
      const staff = await prisma.staff.findUnique({
        where: { user_id: userId }
      });
      if (!staff) {
        return res.status(404).json({ status: 'fail', message: 'Staff profile missing' });
      }
      req.staff = staff;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ status: 'fail', message: 'Not Authorized' });
  }
};
