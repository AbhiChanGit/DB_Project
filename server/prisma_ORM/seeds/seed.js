// seeds/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 0. Clean up existing data
  await prisma.deliveryPlan.deleteMany();        // depends on order
  await prisma.orderItem.deleteMany();           // depends on order
  await prisma.order.deleteMany();
  
  await prisma.cartItem.deleteMany();            // depends on product
  await prisma.supplierProduct.deleteMany();    // <-- NEW
  await prisma.stock.deleteMany();               // depends on product, warehouse
  await prisma.warehouse.deleteMany();           // has address
  await prisma.productPrice.deleteMany();        // depends on product
  await prisma.product.deleteMany();             // must come after dependents
  await prisma.category.deleteMany();            // parent of product
  
  await prisma.creditCard.deleteMany();          // depends on customer
  await prisma.address.deleteMany();             // used by users, warehouse
  await prisma.staff.deleteMany();               // depends on user
  await prisma.customer.deleteMany();            // depends on user
  await prisma.user.deleteMany();                // base
  
  

  // 1. Define seed data
  const users = [
    { username: 'alice_customer', password: 'securePass1!', email: 'alice@example.com', user_type: 'customer' },
    { username: 'bob_staff',    password: 'securePass2!', email: 'bob@shop.com',      user_type: 'staff'    },
  ];

  const customers = [
    { first_name: 'Alice', last_name: 'Anderson', phone: '555-0101', account_balance: 42.50 },
  ];

  const staff = [
    {
      first_name: 'Bob', last_name: 'Brown', phone: '555-0202',
      salary: 55000.00, job_title: 'Inventory Manager',
      hire_date: new Date('2024-01-15'),
    },
  ];

  const aliceAddressData = {
    address_type: 'shipping',
    street_address: '123 Elm St', city: 'Metropolis', state: 'NY',
    postal_code: '10001', country: 'USA', is_default: true,
  };

  const cards = [
    {
      card_number: '4111111111111111',
      card_holder_name: 'Alice Anderson',
      expiry_date: new Date('2026-12-31'),
      cvv: '123',
      is_default: true,
    },
  ];

  const categories = [{ name: 'Electronics', description: 'Gadgets & devices' }];

  const products = [{
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    brand: 'TechBrand',
    product_type: 'accessory',
    size: 'medium',
    image_url: 'https://example.com/mouse.jpg',
  }];

  const productPrices = [{ price: 29.99, start_date: new Date() }];

  const warehouses = [{ name: 'Main Warehouse', capacity: 1000, current_usage: 200 }];

  const stockData = [{ quantity: 150 }];

  const orders = [{
    order_date: new Date(),
    status: 'issued',
    total_amount: 59.98,
  }];

  const orderItems = [{ quantity: 2, unit_price: 29.99 }];

  // 2. Insert

  // Users
  const [aliceUser, bobUser] = await Promise.all(
    users.map(u => prisma.user.create({ data: u }))
  );

  // Profiles
  const aliceCustomer = await prisma.customer.create({
    data: { user_id: aliceUser.id, ...customers[0] },
  });
  const bobStaff = await prisma.staff.create({
    data: { user_id: bobUser.id, ...staff[0] },
  });

  // Alice’s address only
  const aliceAddress = await prisma.address.create({
    data: {
      user_id: aliceUser.id,
      ...aliceAddressData,
    },
  });

  // Alice’s credit card
  const aliceCard = await prisma.creditCard.create({
    data: {
      customer_id: aliceCustomer.id,
      billing_address_id: aliceAddress.id,
      ...cards[0],
    },
  });

  // Category → Product → Price
  const category = await prisma.category.create({ data: categories[0] });
  const product = await prisma.product.create({
    data: { category_id: category.id, ...products[0] },
  });
  await prisma.productPrice.create({
    data: {
      product_id: product.id,
      ...productPrices[0],
      set_by_staff_id: bobStaff.id,
    },
  });

  // Warehouse with an address (tied to Alice so FK works)
  const warehouse = await prisma.warehouse.create({
    data: {
      address: {
        create: {
          user_id: aliceUser.id,
          address_type: 'both',
          street_address: '456 Oak Ave',
          city: 'Gotham',
          state: 'NY',
          postal_code: '10002',
          country: 'USA',
          is_default: false,
        },
      },
      ...warehouses[0],
    },
  });

  // Stock
  await prisma.stock.create({
    data: {
      product_id: product.id,
      warehouse_id: warehouse.id,
      ...stockData[0],
      updated_by_staff_id: bobStaff.id,
    },
  });

  // Order for Alice, using the actual card ID
  const order = await prisma.order.create({
    data: {
      customer_id: aliceCustomer.id,
      credit_card_id: aliceCard.id,
      ...orders[0],
    },
  });

  // OrderItem
  await prisma.orderItem.create({
    data: {
      order_id: order.id,
      product_id: product.id,
      warehouse_id: warehouse.id,
      ...orderItems[0],
    },
  });

  console.log('✅ Seed data inserted successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
