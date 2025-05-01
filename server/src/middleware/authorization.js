const jwt    = require('jsonwebtoken');
const prisma = require('../../../prismaClient');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    // 1) Grab the header
    const authHeader = req.header('Authorization') || req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'fail', message: 'Authorization denied' });
    }

    // 2) Extract the token
    const token = authHeader.slice(7).trim();

    // 3) Verify & decode
    const payload = jwt.verify(token, process.env.jwtSecret);
    console.log('Decoded JWT payload:', payload);

    // 4) Safely read the user ID (supports both { user: { id } } and { id })
    const userId = payload.user?.id ?? payload.id;
    if (!userId) {
      console.error('Auth error: no userId in token payload');
      return res.status(401).json({ status: 'fail', message: 'Not Authorized' });
    }

    // 5) Fetch the User record
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'User not found' });
    }

    // 6) Attach to req for downstream
    req.user = { id: user.id, userType: user.userType };

    // 7) Optionally, if you need full customer/staff profiles:
    if (user.userType === 'customer') {
      const customer = await prisma.customer.findUnique({ where: { id: userId } });
      if (!customer) {
        return res.status(404).json({ status: 'fail', message: 'Customer profile missing' });
      }
      req.customer = customer;
    } else if (user.userType === 'staff') {
      const staff = await prisma.staff.findUnique({ where: { id: userId } });
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
