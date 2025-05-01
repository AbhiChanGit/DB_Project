const router        = require('express').Router();
const bcrypt        = require('bcrypt');
const prisma        = require('../../../prismaClient');
const authorization = require('../middleware/authorization');

// GET /customers/customer
router.get('/customer', authorization, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        customer:     true,
        addresses:    true,
        credit_cards: true,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /customers/orders
router.get('/orders', authorization, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customer_id: req.user.id },
    });
    if (!orders.length) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'No orders found' });
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /customers/products
router.get('/products', authorization, async (req, res, next) => {
  const q = String(req.query.search || '');
  try {
    const products = await prisma.product.findMany({
      where: q
        ? { name: { contains: q, mode: 'insensitive' } }
        : {},
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// PUT /customers/customer_update
router.put('/customer_update', authorization, async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;
    const userData = {};

    if (email) userData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.passwordHash = await bcrypt.hash(password, salt);
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data:  userData,
    });

    if (phone) {
      await prisma.customer.update({
        where: { id: req.user.id },    // now using Prisma field `id`
        data:  { phone },
      });
    }

    res.json({ status: 'success', message: 'Customer profile updated' });
  } catch (err) {
    next(err);
  }
});

// POST /customers/credit_card_create
router.post('/credit_card_create', authorization, async (req, res, next) => {
  try {
    const {
      card_number,
      card_holder_name,
      expiry_date,
      cvv,
      billing_address_id,
      is_default,
    } = req.body;

    const card = await prisma.creditCard.create({
      data: {
        customer_id:        req.user.id,
        card_number,
        card_holder_name,
        expiry_date:        new Date(expiry_date),
        cvv,
        billing_address_id,
        is_default,
      },
    });

    res.json({
      status:  'success',
      message: 'Credit card created',
      card,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /customers/credit_card_update/:card_id
router.put(
  '/credit_card_update/:card_id',
  authorization,
  async (req, res, next) => {
    try {
      const card_id = parseInt(req.params.card_id, 10);
      const {
        card_number,
        card_holder_name,
        expiry_date,
        cvv,
        billing_address_id,
        is_default,
      } = req.body;

      const card = await prisma.creditCard.update({
        where: { card_id },
        data: {
          card_number,
          card_holder_name,
          expiry_date:        new Date(expiry_date),
          cvv,
          billing_address_id,
          is_default,
        },
      });

      res.json({
        status:  'success',
        message: 'Credit card updated',
        card,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
