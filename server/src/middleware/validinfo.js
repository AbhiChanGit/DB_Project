// server/src/middleware/validinfo.js
const prisma = require('../../../prismaClient');

module.exports = async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    user_type,
    salary,
    job_title,
    hire_date,
  } = req.body;

  const validEmail = (e) =>
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e);

  // SIGNUP validation
  if (req.path === '/signup') {
    // presence
    if (![first_name, last_name, email, password, phone, user_type].every(Boolean)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Missing required signup fields' });
    }
    // email format
    if (!validEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Invalid email address' });
    }
    // staff‐only extra fields
    if (user_type === 'staff') {
      if (![salary, job_title, hire_date].every(Boolean)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Staff signup missing salary, job_title, or hire_date',
        });
      }
    }
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return res
        .status(409)
        .json({ status: 'fail', message: 'Email already in use' });
    }
  }

  // LOGIN validation
  if (req.path === '/login') {
    if (![email, password, user_type].every(Boolean)) {
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
