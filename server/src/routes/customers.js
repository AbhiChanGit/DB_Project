const router = require('express').Router();
const bcrypt = require('bcrypt');
const prisma = require('../../../prismaClient');
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

// CREDIT CARD CRUD
// Create
router.post('/credit_card_create', authorization, async (req, res, next) => {
  try {
    const { card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default } = req.body;
    await prisma.creditCard.create({
      data: {
        customer: {
          connect: { customer_id: req.customer.customer_id }
        },
        billing_address: {
          connect: { address_id: billing_address_id }
        },
        card_number,
        card_holder_name,
        expiry_date: new Date(expiry_date),
        cvv,
        is_default
      }
    });      
    res.json({ status: 'success', message: 'Credit card created successfully' });
  } catch (err) {
    next(err);
  }
});
// Update
router.put('/credit_card_update', authorization, async (req, res, next) => {
  try {
    const { card_id, card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default } = req.body;
    const result = await prisma.creditCard.updateMany({
      where: { id: card_id, customer_id: req.customer.id },
      data: { card_number, card_holder_name, expiry_date: new Date(expiry_date), cvv, billing_address_id, is_default },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Credit card not found' });
    }
    res.json({ status: 'success', message: 'Credit card updated successfully' });
  } catch (err) {
    next(err);
  }
});
// Delete
router.delete('/credit_card_delete', authorization, async (req, res, next) => {
  try {
    const { card_id } = req.body;
    const result = await prisma.creditCard.deleteMany({
      where: { id: card_id, customer_id: req.customer.id },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Credit card not found' });
    }
    res.json({ status: 'success', message: 'Credit card deleted successfully' });
  } catch (err) {
    next(err);
  }
});
// List
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

// ADDRESS CRUD
// Create
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
// Update
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
// Delete
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
// List
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

// PRODUCT & SEARCH
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
// Search products
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

// SHOPPING CART & CART ITEMS
// Create cart
router.post('/shopping_cart_create', authorization, async (req, res, next) => {
  try {
    await prisma.shoppingCart.create({ data: { customer_id: req.customer.id } });
    res.json({ status: 'success', message: 'Shopping cart created successfully' });
  } catch (err) {
    next(err);
  }
});
// Add to cart
router.post('/api/v1/cart/:product_id/add', authorization, async (req, res, next) => {
  try {
    const product_id = Number(req.params.product_id);
    const { quantity } = req.body;

    // stock check
    const agg = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { product_id },
    });
    const totalStock = agg._sum.quantity || 0;
    if (totalStock < quantity) {
      return res.status(400).json({ status: 'fail', message: 'Not enough quantity available' });
    }

    // latest cart
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
// Update cart item
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
// Remove from cart
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
// List cart items
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

    // load cart items + current prices
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

    // compute total
    let total_amount = 0;
    for (const item of cartItems) {
      const price = item.product.prices[0]?.price || 0;
      total_amount += price * item.quantity;
    }

    // transaction: order, items, stock, warehouse usage, delivery, balance, clear cart
    const newOrder = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          customer_id: req.customer.id,
          status: 'issued',
          credit_card_id,
          total_amount,
        },
      });

      for (const item of cartItems) {
        const price = item.product.prices[0]?.price || 0;
        const stockEntry = await tx.stock.findFirst({
          where: { product_id: item.product_id, quantity: { gt: 0 } },
          orderBy: { last_updated: 'asc' },
        });
        const wid = stockEntry.warehouse_id;

        await tx.orderItem.create({
          data: {
            order_id: o.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: price,
            warehouse_id: wid,
          },
        });

        // decrement stock
        await tx.stock.update({
          where: { id: stockEntry.id },
          data: { quantity: stockEntry.quantity - item.quantity },
        });

        // adjust warehouse usage if emptied
        if (stockEntry.quantity - item.quantity === 0) {
          await tx.warehouse.update({
            where: { id: wid },
            data: { current_usage: { decrement: 1 } },
          });
        }
      }

      // optional delivery plan
      if (delivery_type) {
        await tx.deliveryPlan.create({
          data: {
            order_id: o.id,
            delivery_type,
            delivery_price: 5.0,
            ship_date: new Date(),
            delivery_date: new Date(Date.now() + 5*24*60*60*1000),
            tracking_number: `TRACK-${o.id}`,
          },
        });
      }

      // adjust account balance
      await tx.customer.update({
        where: { id: req.customer.id },
        data: { account_balance: { increment: total_amount } },
      });

      // clear cart
      await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

      return o;
    });

    res.json({
      status: 'success',
      message: 'Order created successfully',
      order_id: newOrder.id,
    });
  } catch (err) {
    next(err);
  }
});

// CANCEL ORDER
router.put('/order/cancel/:order_id', authorization, async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);

    // wrap in transaction
    await prisma.$transaction(async (tx) => {
      const ord = await tx.order.findFirst({
        where: { id: order_id, customer_id: req.customer.id },
      });
      if (!ord) throw new Error('Order not found');

      // update status
      await tx.order.update({
        where: { id: order_id },
        data: { status: 'cancelled' },
      });

      // refund balance
      await tx.customer.update({
        where: { id: req.customer.id },
        data: { account_balance: { decrement: ord.total_amount } },
      });

      // restore stock
      const items = await tx.orderItem.findMany({ where: { order_id } });
      for (const item of items) {
        await tx.stock.updateMany({
          where: { product_id: item.product_id },
          data: { quantity: { increment: item.quantity } },
        });
      }

      // delete order items + delivery plan
      await tx.orderItem.deleteMany({ where: { order_id } });
      await tx.deliveryPlan.deleteMany({ where: { order_id } });
    });

    res.json({ status: 'success', message: 'Order cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

// LIST ORDERS
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
