// routes/customers.js
// Converted from your original customers.js :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = require('express').Router();
const authorization = require('../middleware/authorization');
const bcrypt = require('bcrypt');

// GET current customer
router.get('/', authorization, async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.users.user_id, user_type: 'customer' },
      include: { customer: true },
    });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Unauthorized' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// UPDATE customer info
router.put('/customer_update', authorization, async (req, res) => {
  const { email, password, phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.users.user_id },
        data: { email, password: hashed },
      }),
      prisma.customer.update({
        where: { user_id: req.users.user_id },
        data: { phone },
      }),
    ]);
    res.json({ status: 'success', message: 'Customer info updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// CREATE credit card
router.post('/credit_card_create', authorization, async (req, res) => {
  const { card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default } = req.body;
  try {
    await prisma.creditCard.create({
      data: {
        customer_id: req.customers.user_id,
        card_number,
        card_holder_name,
        expiry_date: new Date(expiry_date),
        cvv,
        billing_address_id,
        is_default,
      },
    });
    res.json({ status: 'success', message: 'Credit card created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// UPDATE credit card
router.put('/credit_card_update', authorization, async (req, res) => {
  const { card_id, card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default } = req.body;
  try {
    const result = await prisma.creditCard.updateMany({
      where: { id: card_id, customer_id: req.customers.user_id },
      data: {
        card_number,
        card_holder_name,
        expiry_date: new Date(expiry_date),
        cvv,
        billing_address_id,
        is_default,
      },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Credit card not found' });
    }
    res.json({ status: 'success', message: 'Credit card updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// DELETE credit card
router.delete('/credit_card_delete', authorization, async (req, res) => {
  const { card_id } = req.body;
  try {
    const result = await prisma.creditCard.deleteMany({
      where: { id: card_id, customer_id: req.customers.user_id },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Credit card not found' });
    }
    res.json({ status: 'success', message: 'Credit card deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// GET all credit cards
router.get('/credit_cards', authorization, async (req, res) => {
  try {
    const cards = await prisma.creditCard.findMany({
      where: { customer_id: req.customers.user_id },
    });
    if (!cards.length) {
      return res.status(404).json({ status: 'fail', message: 'No credit cards found' });
    }
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// CREATE address
router.post('/address_create', authorization, async (req, res) => {
  const { address_type, street_address, city, state, postal_code, country, is_default } = req.body;
  try {
    await prisma.address.create({
      data: {
        user_id: req.users.user_id,
        address_type,
        street_address,
        city,
        state,
        postal_code,
        country,
        is_default,
      },
    });
    res.json({ status: 'success', message: 'Address created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// UPDATE address
router.put('/address_update', authorization, async (req, res) => {
  const { address_id, address_type, street_address, city, state, postal_code, country, is_default } = req.body;
  try {
    const result = await prisma.address.updateMany({
      where: { id: address_id, user_id: req.users.user_id },
      data: { address_type, street_address, city, state, postal_code, country, is_default },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }
    res.json({ status: 'success', message: 'Address updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// DELETE address
router.delete('/address_delete', authorization, async (req, res) => {
  const { address_id } = req.body;
  try {
    const result = await prisma.address.deleteMany({
      where: { id: address_id, user_id: req.users.user_id },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }
    res.json({ status: 'success', message: 'Address deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// GET all addresses
router.get('/addresses', authorization, async (req, res) => {
  try {
    const list = await prisma.address.findMany({
      where: { user_id: req.users.user_id },
    });
    if (!list.length) {
      return res.status(404).json({ status: 'fail', message: 'No addresses found' });
    }
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// GET all products
router.get('/products', authorization, async (req, res) => {
  try {
    const prods = await prisma.product.findMany();
    if (!prods.length) {
      return res.status(404).json({ status: 'fail', message: 'No products found' });
    }
    res.json(prods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// SEARCH products
router.get('/api/v1/search_product', authorization, async (req, res) => {
  const { search } = req.query;
  try {
    const prods = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { product_type: { contains: search, mode: 'insensitive' } },
        ],
      },
    });
    res.json(prods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// CREATE shopping cart
router.post('/shopping_cart_create', authorization, async (req, res) => {
  try {
    await prisma.shoppingCart.create({
      data: { customer_id: req.customers.user_id },
    });
    res.json({ status: 'success', message: 'Shopping cart created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// ADD item to cart
router.post('/api/v1/cart/:product_id/add', authorization, async (req, res) => {
  const product_id = Number(req.params.product_id);
  const { quantity } = req.body;
  try {
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customers.user_id },
      orderBy: { created_at: 'desc' },
    });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'No shopping cart found' });
    }
    await prisma.cartItem.create({
      data: { cart_id: cart.id, product_id, quantity },
    });
    res.json({ status: 'success', message: 'Product added to cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// UPDATE cart item quantity
router.put('/api/v1/cart/:product_id/update', authorization, async (req, res) => {
  const product_id = Number(req.params.product_id);
  const { quantity } = req.body;
  try {
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customers.user_id },
      orderBy: { created_at: 'desc' },
    });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'No shopping cart found' });
    }
    const result = await prisma.cartItem.updateMany({
      where: { cart_id: cart.id, product_id },
      data: { quantity },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Cart item not found' });
    }
    res.json({ status: 'success', message: 'Product quantity updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// REMOVE item from cart
router.delete('/api/v1/cart/:product_id/remove', authorization, async (req, res) => {
  const product_id = Number(req.params.product_id);
  try {
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customers.user_id },
      orderBy: { created_at: 'desc' },
    });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'No shopping cart found' });
    }
    const result = await prisma.cartItem.deleteMany({
      where: { cart_id: cart.id, product_id },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Cart item not found' });
    }
    res.json({ status: 'success', message: 'Product removed from cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// GET all items in cart
router.get('/api/v1/cart', authorization, async (req, res) => {
  try {
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customers.user_id },
      orderBy: { created_at: 'desc' },
    });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'No shopping cart found' });
    }
    const items = await prisma.cartItem.findMany({
      where: { cart_id: cart.id },
    });
    if (!items.length) {
      return res.status(404).json({ status: 'fail', message: 'No products in cart' });
    }
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

module.exports = router;
