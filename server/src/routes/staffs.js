// routes/staffs.js
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
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      // 1. Update status
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // 2. If cancelled, refund and restore stock
      if (status === 'cancelled') {
        await tx.customer.update({
          where: { id: order.customer_id },
          data: { account_balance: { decrement: order.total_amount } },
        });

        const items = await tx.orderItem.findMany({ where: { order_id: orderId } });
        for (const item of items) {
          await tx.stock.updateMany({
            where: { product_id: item.product_id },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      // 3. If cancelled or delivered, delete items & delivery plan
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

// ADDRESS CRUD
// Create
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
// Update
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
// Delete
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

// WAREHOUSE CRUD
// Create
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
// Update
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
// Delete
router.delete('/:staffId/warehouse/:warehouseId/delete', authorization, async (req, res, next) => {
  try {
    const warehouseId = Number(req.params.warehouseId);
    await prisma.warehouse.delete({ where: { id: warehouseId } });
    res.json({ status: 'success', message: 'Warehouse deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// CATEGORY CRUD
// Create
router.post('/:staffId/categories/create', authorization, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    await prisma.category.create({ data: { name, description } });
    res.json({ status: 'success', message: 'Category added successfully' });
  } catch (err) {
    next(err);
  }
});
// Update
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
// Delete
router.delete('/:staffId/categories/:categoryId/delete', authorization, async (req, res, next) => {
  try {
    const categoryId = Number(req.params.categoryId);
    await prisma.category.delete({ where: { id: categoryId } });
    res.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// PRODUCT + PRICE + STOCK
router.post('/:staffId/products/create', authorization, async (req, res, next) => {
  try {
    const { name, description, brand, size, category_id, price, product_type, warehouse_id, quantity } = req.body;

    await prisma.$transaction(async (tx) => {
      const wh = await tx.warehouse.findUnique({ where: { id: warehouse_id } });
      if (!wh) throw new Error('Warehouse not found');
      if (wh.current_usage + quantity > wh.capacity) {
        throw new Error('Warehouse capacity exceeded');
      }

      const prod = await tx.product.create({
        data: { name, description, category_id, brand, product_type, size },
      });

      await tx.productPrice.create({
        data: { product_id: prod.id, price, set_by_staff_id: req.user.id },
      });

      await tx.stock.create({
        data: {
          product_id: prod.id,
          warehouse_id,
          quantity,
          updated_by_staff_id: req.user.id,
        },
      });

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
    const { name, description, brand, size, category_id, price, product_type } = req.body;

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
      const stockEntries = await tx.stock.findMany({ where: { product_id: productId } });
      for (const entry of stockEntries) {
        await tx.warehouse.update({
          where: { id: entry.warehouse_id },
          data: { current_usage: { decrement: entry.quantity } },
        });
      }
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

//edit category
router.put("/:staffId/categories/:categoryId/update", authorization, async(req, res) => {
    const {categoryId} = req.params;
    const {name, description} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //update categories table
        await db.query("UPDATE categories SET name = $1, description = $2 WHERE category_id = $3", [name, description, categoryId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Category updated successfully"
        })
    } catch(err) {await db.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// delete category
router.delete("/:staffId/categories/:categoryId/delete", authorization, async(req, res) => {
    const {categoryId} = req.params;
    try {
        //Start transaction
        await db.query("BEGIN");
        //delete from categories table
        await db.query("DELETE FROM categories WHERE category_id = $1", [categoryId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Category deleted successfully"
        })
    } catch(err) {
        await db.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// add product and price and stock
router.post("/:staffId/products/create", authorization, async (req, res) => {
    const { staffId } = req.params;
    const { name, description, brand, size, category_id, price, product_type, warehouse_id, quantity } = req.body;

    try {
        // Start transaction
        await db.query("BEGIN");

        // Fetch warehouse current usage and capacity first
        const warehouseResult = await db.query(
            "SELECT current_usage, capacity FROM warehouses WHERE warehouse_id = $1",
            [warehouse_id]
        );

        if (warehouseResult.rowCount === 0) {
            throw new Error("Warehouse not found");
        }

        const { current_usage, capacity } = warehouseResult.rows[0];
        const newUsage = current_usage + quantity;

        // Check if new usage exceeds capacity BEFORE any inserts
        if (newUsage > capacity) {
            await db.query("ROLLBACK");
            return res.status(400).json({
                status: "fail",
                message: "Warehouse capacity exceeded. Please retry with a lower quantity."
            });
        }

        // Insert into products table
        const productResult = await db.query(
            "INSERT INTO products (name, description, category_id, brand, product_type, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING product_id",
            [name, description, category_id, brand, product_type, size]
        );
        const productId = productResult.rows[0].product_id;

        // Insert into product_prices table
        await db.query(
            "INSERT INTO product_prices (product_id, price, set_by_staff_id) VALUES ($1, $2, $3)",
            [productId, price, staffId]
        );

        // Insert into stock table
        await db.query(
            "INSERT INTO stock (product_id, warehouse_id, quantity, updated_by_staff_id) VALUES ($1, $2, $3, $4)",
            [productId, warehouse_id, quantity, staffId]
        );

        // Update warehouse usage
        await db.query(
            "UPDATE warehouses SET current_usage = current_usage + $1 WHERE warehouse_id = $2",
            [quantity, warehouse_id]
        );

        // Commit transaction
        await db.query("COMMIT");

        res.status(200).json({
            status: "success",
            message: "Product added successfully"
        });
    } catch (err) {
        console.error(err.message);
        await db.query("ROLLBACK");
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        });
    }
});

router.put("/:staffId/products/:productId/update", authorization, async (req, res) => {
    const { staffId, productId } = req.params;
    const { name, description, brand, size, category_id, price, product_type } = req.body;

    try {
        // Start transaction
        await db.query("BEGIN");

        // Update products table
        const productUpdate = await db.query(
            "UPDATE products SET name = $1, description = $2, category_id = $3, brand = $4, product_type = $5, size = $6 WHERE product_id = $7",
            [name, description, category_id, brand, product_type, size, productId]
        );

        if (productUpdate.rowCount === 0) {
            throw new Error("Product not found");
        }

        // Update product_prices table
        const priceUpdate = await db.query(
            "UPDATE product_prices SET price = $1, set_by_staff_id = $2 WHERE product_id = $3",
            [price, staffId, productId]
        );

        if (priceUpdate.rowCount === 0) {
            throw new Error("Product price not found");
        }

        // Commit transaction
        await db.query("COMMIT");

        res.status(200).json({
            status: "success",
            message: "Product updated successfully"
        });
    } catch (err) {
        console.error(err.message);
        await db.query("ROLLBACK");
        res.status(500).json({
            status: "fail",
            message: err.message || "Server Error"
        });
    }
});


// delete product and price
router.delete("/:staffId/products/:productId/delete", authorization, async (req, res) => {
    const { staffId, productId } = req.params;
    try {
        // Start transaction
        await db.query("BEGIN");

        // Get stock info first
        const stockResult = await db.query(
            "SELECT quantity, warehouse_id FROM stock WHERE product_id = $1",
            [productId]
        );

        if (stockResult.rowCount === 0) {
            throw new Error("Stock not found for the product");
        }

        const { quantity, warehouse_id } = stockResult.rows[0];

        // Update warehouse current usage
        const warehouseUpdate = await db.query(
            "UPDATE warehouses SET current_usage = current_usage - $1 WHERE warehouse_id = $2",
            [quantity, warehouse_id]
        );

        if (warehouseUpdate.rowCount === 0) {
            throw new Error("Warehouse not found for updating usage");
        }

        // Delete from stock table
        await db.query(
            "DELETE FROM stock WHERE product_id = $1",
            [productId]
        );

        // Delete from product_prices table
        await db.query(
            "DELETE FROM product_prices WHERE product_id = $1",
            [productId]
        );

        // Delete from products table
        const productDelete = await db.query(
            "DELETE FROM products WHERE product_id = $1",
            [productId]
        );

        if (productDelete.rowCount === 0) {
            throw new Error("Product not found for deletion");
        }

        // Commit transaction
        await db.query("COMMIT");

        res.status(200).json({
            status: "success",
            message: "Product deleted successfully and warehouse usage updated"
        });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: err.message || "Server Error"
        });
    }
});


module.exports = router;