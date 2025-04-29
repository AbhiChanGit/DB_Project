const router = require('express').Router();
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const authorization = require('../middleware/authorization');

// UPDATE STAFF INFO
router.put('/staff_update', authorization, async (req, res, next) => {
  try {
    const { email, password, phone, job_title } = req.body;
    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { email, password: hashed },
      }),
      prisma.staff.update({
        where: { user_id: req.user.id },
        data: { phone, job_title },
      }),
    ]);

    res.json({ status: 'success', message: 'Staff info updated successfully' });
  } catch (err) {
    next(err);
  }
});

// UPDATE ORDER STATUS
router.put('/order_update/:orderId', authorization, async (req, res, next) => {
  try {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      if (status === 'cancelled' || status === 'delivered') {
        await tx.orderItem.deleteMany({ where: { order_id: orderId } });
        await tx.deliveryPlan.deleteMany({ where: { order_id: orderId } });
      }
    });

    res.json({ status: 'success', message: 'Order status updated successfully' });
  } catch (err) {
    next(err);
  }
});

// ADD ADDRESS
router.post('/:staffId/address/create', authorization, async (req, res, next) => {
  try {
    const { street_address, city, state, postal_code, country } = req.body;
    await prisma.address.create({
      data: {
        user_id: req.user.id,
        address_type: 'shipping',
        street_address,
        city,
        state,
        postal_code,
        country,
      },
    });
    res.json({ status: 'success', message: 'Address added successfully' });
  } catch (err) {
    next(err);
  }
});

// UPDATE ADDRESS
router.put('/:staffId/address/:addressId/update', authorization, async (req, res, next) => {
  try {
    const addressId = Number(req.params.addressId);
    const { street_address, city, state, postal_code, country } = req.body;

    const result = await prisma.address.updateMany({
      where: { id: addressId, user_id: req.user.id },
      data: { street_address, city, state, postal_code, country },
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
router.delete('/:staffId/address/:addressId/delete', authorization, async (req, res, next) => {
  try {
    const addressId = Number(req.params.addressId);
    const result = await prisma.address.deleteMany({
      where: { id: addressId, user_id: req.user.id },
    });
    if (result.count === 0) {
      return res.status(404).json({ status: 'fail', message: 'Address not found' });
    }
    res.json({ status: 'success', message: 'Address deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ADD WAREHOUSE
router.post('/:staffId/warehouse/create', authorization, async (req, res, next) => {
  try {
    const { name, address_id, capacity } = req.body;
    await prisma.warehouse.create({
      data: { name, address_id, capacity },
    });
    res.json({ status: 'success', message: 'Warehouse added successfully' });
  } catch (err) {
    next(err);
  }
});

// UPDATE WAREHOUSE
router.put('/:staffId/warehouse/:warehouseId/update', authorization, async (req, res, next) => {
  try {
    const warehouseId = Number(req.params.warehouseId);
    const { name, address_id, capacity } = req.body;

    await prisma.warehouse.update({
      where: { id: warehouseId },
      data: { name, address_id, capacity },
    });
    res.json({ status: 'success', message: 'Warehouse updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE WAREHOUSE
router.delete('/:staffId/warehouse/:warehouseId/delete', authorization, async (req, res, next) => {
  try {
    const warehouseId = Number(req.params.warehouseId);
    await prisma.warehouse.delete({ where: { id: warehouseId } });
    res.json({ status: 'success', message: 'Warehouse deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ADD CATEGORY
router.post('/:staffId/categories/create', authorization, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    await prisma.category.create({ data: { name, description } });
    res.json({ status: 'success', message: 'Category added successfully' });
  } catch (err) {
    next(err);
  }
});

// UPDATE CATEGORY
router.put('/:staffId/categories/:categoryId/update', authorization, async (req, res, next) => {
  try {
    const categoryId = Number(req.params.categoryId);
    const { name, description } = req.body;

    await prisma.category.update({
      where: { id: categoryId },
      data: { name, description },
    });
    res.json({ status: 'success', message: 'Category updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE CATEGORY
router.delete('/:staffId/categories/:categoryId/delete', authorization, async (req, res, next) => {
  try {
    const categoryId = Number(req.params.categoryId);
    await prisma.category.delete({ where: { id: categoryId } });
    res.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// CREATE PRODUCT + PRICE + STOCK
router.post('/:staffId/products/create', authorization, async (req, res, next) => {
  try {
    const {
      name,
      description,
      brand,
      size,
      category_id,
      price,
      product_type,
      warehouse_id,
      quantity,
    } = req.body;

    await prisma.$transaction(async (tx) => {
      // Check capacity
      const wh = await tx.warehouse.findUnique({ where: { id: warehouse_id } });
      if (!wh) throw new Error('Warehouse not found');
      if (wh.current_usage + quantity > wh.capacity) {
        throw new Error('Warehouse capacity exceeded');
      }

      // Create product
      const prod = await tx.product.create({
        data: { name, description, category_id, brand, product_type, size },
      });

      // Create price
      await tx.productPrice.create({
        data: { product_id: prod.id, price, set_by_staff_id: req.user.id },
      });

      // Create stock
      await tx.stock.create({
        data: {
          product_id: prod.id,
          warehouse_id,
          quantity,
          updated_by_staff_id: req.user.id,
        },
      });

      // Update warehouse usage
      await tx.warehouse.update({
        where: { id: warehouse_id },
        data: { current_usage: { increment: quantity } },
      });
    });

    res.json({ status: 'success', message: 'Product added successfully' });
  } catch (err) {
    next(err);
  }
});

// UPDATE PRODUCT + PRICE
router.put('/:staffId/products/:productId/update', authorization, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const { name, description, brand, size, category_id, price, product_type } =
      req.body;

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { name, description, category_id, brand, product_type, size },
      }),
      prisma.productPrice.updateMany({
        where: { product_id: productId },
        data: { price, set_by_staff_id: req.user.id },
      }),
    ]);

    res.json({ status: 'success', message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE PRODUCT + PRICE + STOCK
router.delete('/:staffId/products/:productId/delete', authorization, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    await prisma.$transaction(async (tx) => {
      // Fetch stock entry
      const stockEntry = await tx.stock.findFirst({
        where: { product_id: productId },
      });
      if (!stockEntry) throw new Error('Stock not found');

      // Update warehouse usage
      await tx.warehouse.update({
        where: { id: stockEntry.warehouse_id },
        data: { current_usage: { decrement: stockEntry.quantity } },
      });

      // Delete stock, prices, product
      await tx.stock.deleteMany({ where: { product_id: productId } });
      await tx.productPrice.deleteMany({ where: { product_id: productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    res.json({ status: 'success', message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
