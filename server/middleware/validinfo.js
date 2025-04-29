const prisma = require('../prismaClient');

module.exports = async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    user_type,
  } = req.body;

  const validEmail = (e) =>
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e);

  if (req.path === '/signup') {
    // 1. Basic presence checks
    if (![first_name, last_name, email, password, phone, user_type].every(Boolean)) {
      return res.status(401).json({ status: 'fail', message: 'Missing credentials' });
    }
    if (!validEmail(email)) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email' });
    }
    // 2. Enforce unique email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ status: 'fail', message: 'Email already in use' });
    }
  }

  if (req.path === '/login') {
    if (![email, password, user_type].every(Boolean)) {
      return res.status(401).json({ status: 'fail', message: 'Missing credentials' });
    }
    if (!validEmail(email)) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email' });
    }
  }

  next();
};
