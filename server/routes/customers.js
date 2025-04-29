const router = require('express').Router();
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const authorization = require('../middleware/authorization');

// GET CUSTOMER PROFILE
router.get('/customer', authorization, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { customer: true },
    });
    if (!user || user.user_type !== 'customer') {
      return res.status(404).json({ status: 'fail', message: 'Unauthorized' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// UPDATE CUSTOMER INFO
router.put('/customer_update', authorization, async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;
    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { email, password: hashed },
      }),
      prisma.customer.update({
        where: { user_id: req.user.id },
        data: { phone },
      }),
    ]);

    res.json({ status: 'success', message: 'Customer info updated successfully' });
  } catch (err) {
    next(err);
  }
});

// CREATE CREDIT CARD
router.post('/credit_card_create', authorization, async (req, res, next) => {
  try {
    const { card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default } = req.body;
    await prisma.creditCard.create({
      data: {
        customer_id: req.customer.id,
        card_number,
        card_holder_name,
        expiry_date: new Date(expiry_date),
        cvv,
        billing_address_id,
        is_default,
      },
    });
    res.json({ status: 'success', message: 'Credit card info created successfully' });
  } catch (err) {
    next(err);
  }
});

// UPDATE CREDIT CARD
router.put('/credit_card_update', authorization, async (req, res, next) => {
  try {
    const { card_id, card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default } = req.body;
    const result = await prisma.creditCard.updateMany({
      where: { id: card_id, customer_id: req.customer.id },
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
    res.json({ status: 'success', message: 'Credit card info updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE CREDIT CARD
router.delete('/credit_card_delete', authorization, async (req, res, next) => {
  try {
    const { card_id } = req.body;
    const result = await prisma.creditCard.deleteMany({
      where: { id: card_id, customer_id: req.customer.id },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Credit card not found' });
    }
    res.json({ status: 'success', message: 'Credit card info deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET ALL CREDIT CARDS
router.get('/credit_cards', authorization, async (req, res, next) => {
  try {
    const cards = await prisma.creditCard.findMany({
      where: { customer_id: req.customer.id },
    });
    if (!cards.length) {
      return res.status(404).json({ status: 'fail', message: 'No credit cards found' });
    }
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

// CREATE ADDRESS
router.post('/address_create', authorization, async (req, res, next) => {
  try {
    const { address_type, street_address, city, state, postal_code, country, is_default } = req.body;
    await prisma.address.create({
      data: {
        user_id: req.user.id,
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
    next(err);
  }
});

// UPDATE ADDRESS
router.put('/address_update', authorization, async (req, res, next) => {
  try {
    const { address_id, address_type, street_address, city, state, postal_code, country, is_default } = req.body;
    const result = await prisma.address.updateMany({
      where: { id: address_id, user_id: req.user.id },
      data: { address_type, street_address, city, state, postal_code, country, is_default },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }
    res.json({ status: 'success', message: 'Address updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE ADDRESS
router.delete('/address_delete', authorization, async (req, res, next) => {
  try {
    const { address_id } = req.body;
    const result = await prisma.address.deleteMany({
      where: { id: address_id, user_id: req.user.id },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }
    res.json({ status: 'success', message: 'Address deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET ALL ADDRESSES
router.get('/addresses', authorization, async (req, res, next) => {
  try {
    const list = await prisma.address.findMany({
      where: { user_id: req.user.id },
    });
    if (!list.length) {
      return res.status(404).json({ status: 'fail', message: 'No addresses found' });
    }
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET ALL PRODUCTS
router.get('/products', authorization, async (req, res, next) => {
  try {
    const prods = await prisma.product.findMany();
    if (!prods.length) {
      return res.status(404).json({ status: 'fail', message: 'No products found' });
    }
    res.json(prods);
  } catch (err) {
    next(err);
  }
});

// SEARCH PRODUCTS
router.get('/api/v1/search_product', authorization, async (req, res, next) => {
  try {
    const { search } = req.query;
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
    next(err);
  }
});

// SHOPPING CART
router.post('/shopping_cart_create', authorization, async (req, res, next) => {
  try {
    await prisma.shoppingCart.create({
      data: { customer_id: req.customer.id },
    });
    res.json({ status: 'success', message: 'Shopping cart created successfully' });
  } catch (err) {
    next(err);
  }
});

// ADD TO CART
router.post('/api/v1/cart/:product_id/add', authorization, async (req, res, next) => {
  try {
    const product_id = Number(req.params.product_id);
    const { quantity } = req.body;

    // check stock
    const agg = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { product_id },
    });
    const totalStock = agg._sum.quantity || 0;
    if (totalStock < quantity) {
      return res.status(400).json({ status: 'fail', message: 'Not enough quantity available' });
    }

    // get latest cart
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customer.id },
      orderBy: { created_at: 'desc' },
    });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'No shopping cart found' });
    }

    await prisma.cartItem.create({
      data: { cart_id: cart.id, product_id, quantity },
    });
    res.json({ status: 'success', message: 'Product added to shopping cart successfully' });
  } catch (err) {
    next(err);
  }
});

// UPDATE CART ITEM
router.put('/api/v1/cart/:product_id/update', authorization, async (req, res, next) => {
  try {
    const product_id = Number(req.params.product_id);
    const { quantity } = req.body;
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customer.id },
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
    next(err);
  }
});

// REMOVE FROM CART
router.delete('/api/v1/cart/:product_id/remove', authorization, async (req, res, next) => {
  try {
    const product_id = Number(req.params.product_id);
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customer.id },
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
    res.json({ status: 'success', message: 'Product removed from shopping cart successfully' });
  } catch (err) {
    next(err);
  }
});

// GET CART ITEMS
router.get('/api/v1/cart', authorization, async (req, res, next) => {
  try {
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customer.id },
      orderBy: { created_at: 'desc' },
    });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'No shopping cart found' });
    }
    const items = await prisma.cartItem.findMany({ where: { cart_id: cart.id } });
    if (!items.length) {
      return res.status(404).json({ status: 'fail', message: 'No products found in shopping cart' });
    }
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// CREATE ORDER
router.post('/order/create', authorization, async (req, res, next) => {
  try {
    const { delivery_type, credit_card_id } = req.body;

    // fetch latest cart & items with prices
    const cart = await prisma.shoppingCart.findFirst({
      where: { customer_id: req.customer.id },
      orderBy: { created_at: 'desc' },
    });
    if (!cart) {
      return res.status(400).json({ status: 'fail', message: 'No items in cart' });
    }
    const cartItems = await prisma.cartItem.findMany({
      where: { cart_id: cart.id },
      include: {
        product: {
          include: {
            prices: {
              where: { end_date: null },
              orderBy: { start_date: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
    if (!cartItems.length) {
      return res.status(400).json({ status: 'fail', message: 'No items in cart' });
    }

    // calculate total
    let total_amount = 0;
    for (const item of cartItems) {
      const price = item.product.prices[0]?.price || 0;
      total_amount += price * item.quantity;
    }

    // transaction: create order, items, adjust stock, delivery, clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customer_id: req.customer.id,
          status: 'issued',
          credit_card_id,
          total_amount,
        },
      });

      for (const item of cartItems) {
        const price = item.product.prices[0]?.price || 0;
        // pick a warehouse with stock
        const stockEntry = await tx.stock.findFirst({
          where: { product_id: item.product_id, quantity: { gt: 0 } },
          orderBy: { last_updated: 'asc' },
        });
        const warehouse_id = stockEntry.warehouse_id;

        // create order item
        await tx.orderItem.create({
          data: {
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: price,
            warehouse_id,
          },
        });

        // decrement stock
        await tx.stock.update({
          where: { id: stockEntry.id },
          data: { quantity: stockEntry.quantity - item.quantity },
        });

        // if stock now zero, decrement warehouse usage
        if (stockEntry.quantity - item.quantity === 0) {
          await tx.warehouse.update({
            where: { id: warehouse_id },
            data: { current_usage: { decrement: 1 } },
          });
        }
      }

      // optional delivery plan
      if (delivery_type) {
        await tx.deliveryPlan.create({
          data: {
            order_id: newOrder.id,
            delivery_type,
            delivery_price: 5.0,
            ship_date: new Date(),
            delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            tracking_number: `TRACK-${newOrder.id}`,
          },
        });
      }

      // clear cart
      await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

      return newOrder;
    });

    res.json({
      status: 'success',
      message: 'Order created successfully',
      order_id: order.id,
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL ORDERS
router.get('/orders', authorization, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customer_id: req.customer.id },
    });
    if (!orders.length) {
      return res.status(404).json({ status: 'fail', message: 'No orders found' });
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
