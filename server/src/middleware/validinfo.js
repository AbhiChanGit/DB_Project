const prisma = require('../../../prismaClient');

module.exports = async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    userType,
  } = req.body;

  const validEmail = (e) =>
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e);

  // SIGNUP validation
  if (req.path === '/signup') {
    // 1) All six fields required
    if (![first_name, last_name, email, password, phone, userType].every(Boolean)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Missing required signup fields' });
    }
    // 2) Email format
    if (!validEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Invalid email address' });
    }
    // 3) No duplicates
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ status: 'fail', message: 'Email already in use' });
    }
  }

  // LOGIN validation
  if (req.path === '/login') {
    if (![email, password, userType].every(Boolean)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Missing login credentials' });
    }
    if (!validEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Invalid email address' });
    }
  }

  next();
};
