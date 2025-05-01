const router = require('express').Router();
const bcrypt = require('bcrypt');
const prisma = require('../../../prismaClient');
const authorization = require('../middleware/authorization');

// PUT /staffs/staff_update
router.put('/staff_update', authorization, async (req, res, next) => {
  try {
    const { email, password, phone, job_title } = req.body;
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

    const staffData = {};
    if (phone)     staffData.phone    = phone;
    if (job_title) staffData.jobTitle = job_title;

    if (Object.keys(staffData).length > 0) {
      await prisma.staff.update({
        where: { id: req.user.id },    // now using Prisma field `id`
        data:  staffData,
      });
    }

    res.json({ status: 'success', message: 'Staff profile updated' });
  } catch (err) {
    next(err);
  }
});

// PUT /staffs/order_update/:order_id
router.put('/order_update/:order_id', authorization, async (req, res, next) => {
  try {
    const order_id = parseInt(req.params.order_id, 10);
    const { status } = req.body;
    await prisma.order.update({
      where: { order_id },
      data: { status },
    });
    if (status === 'cancelled' || status === 'delivered') {
      await prisma.orderItem.deleteMany({ where: { order_id } });
      await prisma.deliveryPlan.deleteMany({ where: { order_id } });
    }
    res.json({ status: 'success', message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
});

// POST /staffs/:staff_id/address/create
router.post('/:staff_id/address/create', authorization, async (req, res, next) => {
  try {
    const user_id = parseInt(req.params.staff_id, 10);
    const { street_address, city, state, postal_code, country } = req.body;
    const address = await prisma.address.create({
      data: {
        user_id,
        address_type: 'shipping',
        street_address,
        city,
        state,
        postal_code,
        country,
      },
    });
    res.json({ status: 'success', message: 'Address added', address });
  } catch (err) {
    next(err);
  }
});

// PUT /staffs/:staff_id/address/:address_id/update
router.put('/:staff_id/address/:address_id/update', authorization, async (req, res, next) => {
  try {
    const address_id = parseInt(req.params.address_id, 10);
    const { street_address, city, state, postal_code, country } = req.body;
    await prisma.address.update({
      where: { address_id },
      data: { street_address, city, state, postal_code, country },
    });
    res.json({ status: 'success', message: 'Address updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /staffs/:staff_id/address/:address_id/delete
router.delete('/:staff_id/address/:address_id/delete', authorization, async (req, res, next) => {
  try {
    const address_id = parseInt(req.params.address_id, 10);
    await prisma.address.delete({ where: { address_id } });
    res.json({ status: 'success', message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /staffs/:staff_id/warehouse/create
router.post('/:staff_id/warehouse/create', authorization, async (req, res, next) => {
  try {
    const { name, address_id, capacity } = req.body;
    const wh = await prisma.warehouse.create({
      data: { name, address_id, capacity },
    });
    res.json({ status: 'success', message: 'Warehouse created', warehouse: wh });
  } catch (err) {
    next(err);
  }
});

// PUT /staffs/:staff_id/warehouse/:warehouse_id/update
router.put('/:staff_id/warehouse/:warehouse_id/update', authorization, async (req, res, next) => {
  try {
    const warehouse_id = parseInt(req.params.warehouse_id, 10);
    const { name, address_id, capacity } = req.body;
    await prisma.warehouse.update({
      where: { warehouse_id },
      data: { name, address_id, capacity },
    });
    res.json({ status: 'success', message: 'Warehouse updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /staffs/:staff_id/warehouse/:warehouse_id/delete
router.delete('/:staff_id/warehouse/:warehouse_id/delete', authorization, async (req, res, next) => {
  try {
    const warehouse_id = parseInt(req.params.warehouse_id, 10);
    await prisma.warehouse.delete({ where: { warehouse_id } });
    res.json({ status: 'success', message: 'Warehouse deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /staffs/:staff_id/categories/create
router.post('/:staff_id/categories/create', authorization, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const cat = await prisma.category.create({
      data: { name, description },
    });
    res.json({ status: 'success', message: 'Category created', category: cat });
  } catch (err) {
    next(err);
  }
});

// PUT /staffs/:staff_id/categories/:category_id/update
router.put('/:staff_id/categories/:category_id/update', authorization, async (req, res, next) => {
  try {
    const category_id = parseInt(req.params.category_id, 10);
    const { name, description } = req.body;
    await prisma.category.update({
      where: { category_id },
      data: { name, description },
    });
    res.json({ status: 'success', message: 'Category updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /staffs/:staff_id/categories/:category_id/delete
router.delete('/:staff_id/categories/:category_id/delete', authorization, async (req, res, next) => {
  try {
    const category_id = parseInt(req.params.category_id, 10);
    await prisma.category.delete({ where: { category_id } });
    res.json({ status: 'success', message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /staffs/:staff_id/products/create
router.post('/:staff_id/products/create', authorization, async (req, res, next) => {
  try {
    const staff_id = parseInt(req.params.staff_id, 10);
    const { name, description, brand, size, category_id, price, product_type, warehouse_id, quantity } = req.body;
    const prod = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: { name, description, category_id, brand, product_type, size },
      });
      await tx.productPrice.create({
        data: { product_id: p.product_id, price, set_by_staff_id: staff_id },
      });
      await tx.stock.create({
        data: { product_id: p.product_id, warehouse_id, quantity, updated_by_staff_id: staff_id },
      });
      await tx.warehouse.update({
        where: { warehouse_id },
        data: { current_usage: { increment: quantity } },
      });
      return p;
    });
    res.json({ status: 'success', message: 'Product created', product: prod });
  } catch (err) {
    next(err);
  }
});

// PUT /staffs/:staff_id/products/:product_id/update
router.put('/:staff_id/products/:product_id/update', authorization, async (req, res, next) => {
  try {
    const product_id = parseInt(req.params.product_id, 10);
    const { name, description, brand, size, category_id, price, product_type } = req.body;
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { product_id },
        data: { name, description, category_id, brand, product_type, size },
      });
      await tx.productPrice.update({
        where: { price_id: (await tx.productPrice.findFirst({ where: { product_id }, orderBy: { start_date: 'desc' } })).price_id },
        data: { price, set_by_staff_id: req.params.staff_id },
      });
    });
    res.json({ status: 'success', message: 'Product updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /staffs/:staff_id/products/:product_id/delete
router.delete('/:staff_id/products/:product_id/delete', authorization, async (req, res, next) => {
  try {
    const product_id = parseInt(req.params.product_id, 10);
    await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findFirst({ where: { product_id } });
      if (stock) {
        await tx.warehouse.update({
          where: { warehouse_id: stock.warehouse_id },
          data: { current_usage: { decrement: stock.quantity } },
        });
      }
      await tx.stock.deleteMany({ where: { product_id } });
      await tx.productPrice.deleteMany({ where: { product_id } });
      await tx.product.delete({ where: { product_id } });
    });
    res.json({ status: 'success', message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
