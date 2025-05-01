// server/prisma_ORM/seeds/seed.js

const { PrismaClient, UserType } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      username: 'alice_customer',
      password: 'securePass1!',
      email:    'alice@example.com',
      userType: 'customer',   // must be camelCase
    },
    {
      username: 'bob_staff',
      password: 'securePass2!',
      email:    'bob@example.com',
      userType: 'staff',
    },
  ];

  // Create users with hashed passwords and correct field names
  const [aliceUser, bobUser] = await Promise.all(
    users.map(async u => {
      const passwordHash = await bcrypt.hash(u.password, 10);
      return prisma.user.create({
        data: {
          username:     u.username,
          passwordHash,          // supply the actual hash
          email:        u.email,
          userType:     u.userType,  // use Prisma field name
        }
      });
    })
  );

  // now create corresponding customer and staff rows…
  await prisma.customer.create({
    data: {
      id:        aliceUser.id,
      firstName: 'Alice',
      lastName:  'Anderson',
      phone:     '555-1234',
    }
  });

  await prisma.staff.create({
    data: {
      id:        bobUser.id,
      firstName: 'Bob',
      lastName:  'Builder',
      phone:     '555-5678',
      salary:    60000,
      jobTitle:  'Manager',
      hireDate:  new Date('2025-01-01'),
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
