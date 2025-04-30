const jwt = require('jsonwebtoken');
const prisma = require('../../../prismaClient');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'fail', message: 'Authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.jwtSecret);
    const userId = payload.user.id;
    console.log('JWT Secret:', process.env.jwtSecret);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    req.user = user;

    if (user.user_type === 'customer') {
      const customer = await prisma.customer.findUnique({
        where: { customer_id: userId }
      });
      if (!customer) {
        return res.status(404).json({ status: 'fail', message: 'Customer profile missing' });
      }
      req.customer = customer;
    }

    if (user.user_type === 'staff') {
      const staff = await prisma.staff.findUnique({
        where: { staff_id: userId }
      });
      if (!staff) {
        return res.status(404).json({ status: 'fail', message: 'Staff profile missing' });
      }
      req.staff = staff;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ status: 'fail', message: 'Not Authorized' });
  }
};


