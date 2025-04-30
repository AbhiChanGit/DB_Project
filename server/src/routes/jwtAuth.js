const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwtGenerator = require('../services/utils/jwtGenerator');
const validInfo = require('../middleware/validinfo');
const prisma = require('../../../prismaClient');
const nodemailer = require('nodemailer');
const authorization = require('../middleware/authorization');
const { Prisma } = require('@prisma/client');


const userDataStorage = {};

// send email helper
const sendVerificationCode = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'luudang04@gmail.com',
      pass: 'begb lrfn rzfv pswu'
    },
  });
  await transporter.sendMail({
    from: 'luudang04@gmail.com',
    to: email,
    subject: 'Verification Code',
    text: `Your verification code is ${code}. It is valid for 10 minutes.`
  });
};

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// login
router.post('/login', validInfo, async (req, res, next) => {
  try {
    const { email, password, user_type } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, user_type }
    });
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const token = jwtGenerator(user.id);
    res.json({ jwToken: token });
  } catch (err) {
    next(err);
  }
});

// signup
router.post('/signup', validInfo, async (req, res, next) => {
  try {
    const { first_name, last_name, phone, email, password, user_type, salary, job_title, hire_date } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ status: 'fail', message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // generate unique username
    const base = email.split('@')[0];
    let username = base;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${base}${counter++}`;
    }

    const code = generateVerificationCode();
    await sendVerificationCode(email, code);

    userDataStorage[email] = {
      first_name, last_name, phone,
      email, password: hashed, user_type,
      username, salary, job_title, hire_date,
      code,
    };

    // upsert verifying table via raw SQL
    await prisma.$executeRaw`DELETE FROM verifying WHERE email = ${email}`;
    await prisma.$executeRaw`INSERT INTO verifying (email, code) VALUES (${email}, ${code})`;

    res.json({
      status: 'success',
      message: 'Verification code sent; valid for 10 minutes.',
      userDataStorage: userDataStorage[email]
    });
  } catch (err) {
    next(err);
  }
});

// verify signup
router.post('/verify-signup', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const stored = userDataStorage[email];
    if (!stored) {
      return res.status(400).json({ status: 'fail', message: 'No sign-up data for this email.' });
    }

    // Check if code matches what's in DB
    const rows = await prisma.$queryRaw`
      SELECT * FROM verifying WHERE email = ${email} AND code = ${code}
    `;
    if (!rows.length) {
      return res.status(400).json({ status: 'fail', message: 'Invalid verification code.' });
    }

    // Final check: does the user already exist?
    const existingUser = await prisma.user.findUnique({ where: { email: stored.email } });
    if (existingUser) {
      delete userDataStorage[email];
      await prisma.$executeRaw`DELETE FROM verifying WHERE email = ${email}`;
      return res.status(409).json({ status: 'fail', message: 'User already exists' });
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        username: stored.username,
        password: stored.password,
        email: stored.email,
        user_type: stored.user_type,
      },
    });

    // Create profile
    if (stored.user_type === 'customer') {
      await prisma.customer.create({
        data: {
          customer_id: user.id,
          first_name: stored.first_name,
          last_name: stored.last_name,
          phone: stored.phone,
          account_balance: new Prisma.Decimal(0.00) 
        },
      });
    } 
    else if (stored.user_type === 'staff') {
      await prisma.staff.create({
        data: {
          staff_id: user.id, // must match the related user's id
          first_name: stored.first_name,
          last_name: stored.last_name,
          phone: stored.phone,
          salary: new Prisma.Decimal(stored.salary), // if stored.salary is not already Decimal
          job_title: stored.job_title,
          hire_date: new Date(stored.hire_date),
        },
      });
    }

    // Cleanup
    delete userDataStorage[email];
    await prisma.$executeRaw`DELETE FROM verifying WHERE email = ${email}`;

    // Send token
    const token = jwtGenerator(user.id);
    res.json({ jwToken: token });

  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ status: 'fail', message: 'Email or username already taken' });
    }
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error',
      error: err.message 
    });
  }
});


// forgot password
router.post('/forgot-password', validInfo, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Email not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const code = generateVerificationCode();
    await sendVerificationCode(email, code);
    userDataStorage[email] = { password: hashed };

    await prisma.$executeRaw`DELETE FROM verifying WHERE email = ${email}`;
    await prisma.$executeRaw`INSERT INTO verifying (email, code) VALUES (${email}, ${code})`;

    res.json({ status: 'success', message: 'Verification code sent' });
  } catch (err) {
    next(err);
  }
});

// verify forgot password
router.put('/verify-forgot-password', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const stored = userDataStorage[email];
    if (!stored) {
      return res.status(400).json({ status: 'fail', message: 'No reset data for this email.' });
    }

    const rows = await prisma.$queryRaw`SELECT * FROM verifying WHERE email = ${email} AND code = ${code}`;
    if (!rows.length) {
      return res.status(400).json({ status: 'fail', message: 'Invalid verification code.' });
    }

    await prisma.user.update({
      where: { email },
      data: { password: stored.password },
    });
    delete userDataStorage[email];
    await prisma.$executeRaw`DELETE FROM verifying WHERE email = ${email}`;

    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// check auth
router.get('/is-verify', authorization, (_req, res) => {
  res.json(true);
});

module.exports = router;
