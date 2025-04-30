const router       = require('express').Router();
const bcrypt       = require('bcrypt');
const jwtGenerator = require('../services/utils/jwtGenerator');
const validInfo    = require('../middleware/validinfo');
const prisma       = require('../../../prismaClient');
const nodemailer   = require('nodemailer');

// In-memory store for pending verification codes
const userDataStorage = {};


// Helpers
async function sendVerificationCode(email, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your@gmail.com',
      pass: 'your-app-password',
    },
  });
  await transporter.sendMail({
    from: 'your@gmail.com',
    to: email,
    subject: 'Verification Code',
    text: `Your verification code is ${code}. It is valid for 10 minutes.`,
  });
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


// POST
router.post('/login', validInfo, async (req, res, next) => {
  try {
    const { email, password, user_type } = req.body;

    // 1) Find the user
    const user = await prisma.user.findFirst({
      where: { email, user_type }
    });
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    // 2) Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    // 3) Sign a token
    const jwToken = jwtGenerator(user.id);
    return res.json({ jwToken });
  } catch (err) {
    next(err);
  }
});


// POST
router.post('/signup', validInfo, async (req, res, next) => {
  try {
    const {
      first_name, last_name, phone,
      email, password, user_type,
      salary, job_title, hire_date
    } = req.body;

    // 1) Check for existing email
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ status: 'fail', message: 'User already exists' });
    }

    // 2) Hash password
    const salt  = await bcrypt.genSalt(10);
    const hash  = await bcrypt.hash(password, salt);

    // 3) Build unique username
    let base = email.split('@')[0];
    let username = base;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${base}${counter++}`;
    }

    // 4) Generate & email code
    const code = generateVerificationCode();
    await sendVerificationCode(email, code);
    userDataStorage[email] = {
      first_name, last_name, phone,
      email, password: hash, user_type,
      username, salary, job_title, hire_date,
      code,
    };

    // 5) Store in verifying table
    await prisma.verifying.deleteMany({ where: { email } });
    await prisma.verifying.create({ data: { email, code } });

    return res.json({
      status: 'success',
      message: 'Verification code sent; valid for 10 minutes.',
    });
  } catch (err) {
    next(err);
  }
});


// POST
router.post('/verify-signup', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const stored = userDataStorage[email];
    if (!stored) {
      return res.status(400).json({ status: 'fail', message: 'No sign-up data for this email.' });
    }

    // 1) Check code
    const match = await prisma.verifying.findFirst({ where: { email, code } });
    if (!match) {
      return res.status(400).json({ status: 'fail', message: 'Invalid verification code.' });
    }

    // 2) Create user
    const user = await prisma.user.create({
      data: {
        username:  stored.username,
        password:  stored.password,
        email:     stored.email,
        user_type: stored.user_type,
      }
    });

    // 3) Create profile record
    if (stored.user_type === 'customer') {
      await prisma.customer.create({
        data: {
          user_id:         user.id,
          first_name:      stored.first_name,
          last_name:       stored.last_name,
          phone:           stored.phone,
          account_balance: 0.0,
        }
      });
    } else {
      await prisma.staff.create({
        data: {
          user_id:   user.id,
          first_name: stored.first_name,
          last_name:  stored.last_name,
          phone:      stored.phone,
          salary:     parseFloat(stored.salary),
          job_title:  stored.job_title,
          hire_date:  new Date(stored.hire_date),
        }
      });
    }

    // 4) Cleanup & respond
    delete userDataStorage[email];
    await prisma.verifying.deleteMany({ where: { email } });

    const jwToken = jwtGenerator(user.id);
    return res.json({ jwToken });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ status: 'fail', message: 'Email or username already taken' });
    }
    next(err);
  }
});


// POST
router.post('/forgot-password', validInfo, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Email not found' });
    }

    // 1) Hash new password & send code
    const salt  = await bcrypt.genSalt(10);
    const hash  = await bcrypt.hash(password, salt);
    const code  = generateVerificationCode();
    await sendVerificationCode(email, code);
    userDataStorage[email] = { password: hash };

    // 2) Store code
    await prisma.verifying.deleteMany({ where: { email } });
    await prisma.verifying.create({ data: { email, code } });

    return res.json({ status: 'success', message: 'Verification code sent' });
  } catch (err) {
    next(err);
  }
});


// PUT
router.put('/verify-forgot-password', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const stored = userDataStorage[email];
    if (!stored) {
      return res.status(400).json({ status: 'fail', message: 'No reset data for this email.' });
    }

    // Validate code
    const match = await prisma.verifying.findFirst({ where: { email, code } });
    if (!match) {
      return res.status(400).json({ status: 'fail', message: 'Invalid verification code.' });
    }

    // Update password
    await prisma.user.update({
      where: { email },
      data:  { password: stored.password }
    });

    delete userDataStorage[email];
    await prisma.verifying.deleteMany({ where: { email } });
    return res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});


// GET
const authorization = require('../middleware/authorization');
router.get('/is-verify', authorization, (_req, res) => {
  res.json(true);
});

module.exports = router;
