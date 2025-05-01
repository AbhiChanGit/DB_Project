const router       = require('express').Router();
const bcrypt       = require('bcrypt');
const jwtGenerator = require('../services/utils/jwtGenerator');
const validInfo    = require('../middleware/validinfo');
const prisma       = require('../../../prismaClient');
const nodemailer   = require('nodemailer');

// In-memory store for pending sign-ups & password resets
const userDataStorage = {};

// // Helper to send a 6-digit code
// async function sendVerificationCode(email, code) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Your verification code',
//     text: `Your verification code is ${code}`,
//   });
// }

const sendVerificationCode = async (email, code) => {
  console.log(`🔑 Verification code for ${email}: ${code}`);
};

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /signup
router.post('/signup', validInfo, async (req, res, next) => {
  try {
    const {
      first_name, last_name, phone,
      email,       password,   userType,
      salary,      job_title,  hire_date,
    } = req.body;

    // 1) Prevent duplicate email
    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(409).json({ status: 'fail', message: 'User already exists' });
    }

    // 2) Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 3) Pick a unique username
    let base     = email.split('@')[0];
    let username = base;
    let counter  = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${base}${counter++}`;
    }

    // 4) Generate & “email” code
    const code = generateVerificationCode();
    await sendVerificationCode(email, code);

    // 5) Persist the code in Postgres
    await prisma.verifying.deleteMany({ where: { email } });
    await prisma.verifying.create({ data: { email, code } });

    // 6) Return the username and (hashed) password back to the front
    //    so the front end can carry them into the verify step.
    return res.json({
      status:   'success',
      message:  'Verification code sent; valid for 10 minutes.',
      payload:  { username, passwordHash: hash },
    });
  } catch (err) {
    next(err);
  }
});

// POST /verify-signup
router.post('/verify-signup', async (req, res, next) => {
  try {
    // pull everything from the front-end
    const {
      email,
      code,
      first_name,
      last_name,
      phone,
      username,
      password,   // plaintext
      userType,
      salary,
      job_title,
      hire_date,
    } = req.body;

    // 1) Verify the code against your DB
    const match = await prisma.verifying.findFirst({ where: { email, code } });
    if (!match) {
      return res.status(400).json({ status: 'fail', message: 'Invalid verification code.' });
    }

    // 2) Hash the plaintext password again
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Create the User
    const user = await prisma.user.create({
      data: { username, passwordHash, email, userType },
    });

    // 4) Create either a Customer or Staff record
    if (userType === 'customer') {
      await prisma.customer.create({
        data: {
          id:        user.id,
          firstName: first_name,
          lastName:  last_name,
          phone,
        },
      });
    } else {
      await prisma.staff.create({
        data: {
          id:        user.id,
          firstName: first_name,
          lastName:  last_name,
          phone,
          salary:    salary,
          jobTitle:  job_title,
          hireDate:  new Date(hire_date),
        },
      });
    }

    // 5) Clean up the code in the DB
    await prisma.verifying.deleteMany({ where: { email } });

    return res.json({ status: 'success', message: 'Signup verified!' });
  } catch (err) {
    next(err);
  }
});

// POST /login
router.post('/login', validInfo, async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    // 1) Lookup by email + type
    const user = await prisma.user.findFirst({ where: { email, userType } });
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    // 2) Check password
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    // 3) Issue JWT
    const token = jwtGenerator(user.id, user.userType);
    return res.json({ status: 'success', token });
  } catch (err) {
    next(err);
  }
});

// POST /forgot-password
router.post('/forgot-password', validInfo, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email not found' });
    }

    // 1) Hash & email a reset code
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const code = generateVerificationCode();
    await sendVerificationCode(email, code);
    userDataStorage[email] = { password: hash };

    // 2) Store code
    await prisma.verifying.deleteMany({ where: { email } });
    await prisma.verifying.create({ data: { email, code } });

    return res.json({
      status: 'success',
      message: 'Verification code sent',
    });
  } catch (err) {
    next(err);
  }
});

// PUT /verify-forgot-password
router.put('/verify-forgot-password', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const stored = userDataStorage[email];
    if (!stored) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'No reset data for this email.' });
    }

    // 1) Check code
    const match = await prisma.verifying.findFirst({
      where: { email, code },
    });
    if (!match) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Invalid verification code.' });
    }

    // 2) Update password
    await prisma.user.update({
      where: { email },
      data:  { passwordHash: stored.password },
    });

    // 3) Cleanup
    delete userDataStorage[email];
    await prisma.verifying.deleteMany({ where: { email } });

    return res.json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /is-verify
const authorization = require('../middleware/authorization');
router.get('/is-verify', authorization, (_req, res) => {
  res.json(true);
});

module.exports = router;
