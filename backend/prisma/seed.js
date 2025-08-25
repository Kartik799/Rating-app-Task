import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const ownerPass = await bcrypt.hash('Owner@123', 10);
  const userPass = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@example.com',
      address: 'HQ',
      passwordHash: adminPass,
      role: 'ADMIN'
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Default Store Owner',
      email: 'owner@example.com',
      address: 'Owner St',
      passwordHash: ownerPass,
      role: 'OWNER'
    }
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Normal User Sample',
      email: 'user@example.com',
      address: 'User Ave',
      passwordHash: userPass,
      role: 'USER'
    }
  });

  await prisma.store.upsert({
    where: { email: 'store@example.com' },
    update: {},
    create: {
      name: 'Sample Store',
      email: 'store@example.com',
      address: '123 Market Road',
      ownerId: owner.id
    }
  });

  console.log('Seeded admin/owner/user and one store.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
