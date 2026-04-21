import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { key: 'FREE' },
    update: {},
    create: {
      key: 'FREE',
      name: 'Free',
      tokensPerDay: 5,
      sitesPerDay: 1,
      sitesPerMonth: 1,
      priorityQueue: false,
    },
  });

  await prisma.plan.upsert({
    where: { key: 'PRO' },
    update: {},
    create: {
      key: 'PRO',
      name: 'Pro',
      tokensPerDay: 5000,
      sitesPerDay: 0,
      sitesPerMonth: 2,
      priorityQueue: true,
    },
  });

  await prisma.plan.upsert({
    where: { key: 'SUPER' },
    update: {},
    create: {
      key: 'SUPER',
      name: 'Super',
      tokensPerDay: 1000000,
      sitesPerDay: 1000000,
      sitesPerMonth: 1000000,
      priorityQueue: true,
    },
  });

  // Demo user: demo / demo
  const demoEmail = 'demo@lmnt.dev';
  const demoPassword = 'demo';
  const demoPasswordHash = await bcrypt.hash(demoPassword, 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash: demoPasswordHash },
    create: {
      email: demoEmail,
      passwordHash: demoPasswordHash,
    },
    select: { id: true },
  });

  await prisma.subscription.upsert({
    where: { id: `demo-sub-${demoUser.id}` },
    update: { status: 'active', planKey: 'FREE' },
    create: {
      id: `demo-sub-${demoUser.id}`,
      userId: demoUser.id,
      planKey: 'FREE',
      status: 'active',
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

