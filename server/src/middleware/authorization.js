const jwt = require('jsonwebtoken');
const prisma = require('../../../prismaClient');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    // 1) Grab the header
    const authHeader = req.header('Authorization') || req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'fail', message: 'Authorization denied' });
    }

    // 2) Extract the token part
    const token = authHeader.slice(7).trim(); // remove 'Bearer '

    // 3) Verify & decode
    const payload = jwt.verify(token, process.env.jwtSecret);
    const userId = payload.user.id;
    console.log('JWT Secret:', process.env.jwtSecret);

    // 4) Fetch the actual user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'User not found' });
    }

    req.user = user;

    // 5) If customer, load their profile
    if (user.user_type === 'customer') {
      const customer = await prisma.customer.findUnique({ where: { user_id: userId } });
      if (!customer) {
        return res.status(404).json({ status: 'fail', message: 'Customer profile missing' });
      }
      req.customer = customer;
    }

    // 6) If staff, load their profile
    if (user.user_type === 'staff') {
      const staff = await prisma.staff.findUnique({ where: { user_id: userId } });
      if (!staff) {
        return res.status(404).json({ status: 'fail', message: 'Staff profile missing' });
      }
      req.staff = staff;
    }

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ status: 'fail', message: 'Not Authorized' });
  }
};