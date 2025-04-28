// routes/staffs.js
// Converted from your original staffs.js :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = require('express').Router();
const authorization = require('../middleware/authorization');
const bcrypt = require('bcrypt');

// UPDATE staff info
router.put('/customer_update', authorization, async (req, res) => {
  const { email, password, phone, job_title } = req.body;
  try {
    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.users.user_id },
        data: { email, password: hashed },
      }),
      prisma.staff.update({
        where: { user_id: req.users.user_id },
        data: { phone, job_title },
      }),
    ]);
    res.json({ status: 'success', message: 'Customer info updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

// ADD new product + initial price
router.post('/api/v1/products/:productId/create', authorization, async (req, res) => {
  const productId = Number(req.params.productId);
  const { name, description, brand, size, image_url, price } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: { id: productId, name, description, brand, size, image_url },
      });
      await tx.productPrice.create({
        data: {
          product_id: product.id,
          price: Number(price),
          set_by_staff_id: req.users.user_id,
        },
      });
    });
    res.json({ status: 'success', message: 'Product added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server Error' });
  }
});

module.exports = router;
