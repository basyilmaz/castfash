import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ORG_NAME = 'Castfash Studio';
const ADMIN_EMAIL = 'founder@castfash.com';
const ADMIN_PASSWORD = 'Castfash!2024';
const DEMO_EMAIL = 'demo@castfash.com';
const DEMO_PASSWORD = 'Castfash-demo1';

async function ensureOrganization() {
  const existing = await prisma.organization.findFirst({
    where: { name: ORG_NAME },
  });
  if (existing) return existing;

  return prisma.organization.create({
    data: {
      name: ORG_NAME,
      ownerId: 0, // temporary, will update after owner user is ensured
      remainingCredits: 200,
    },
  });
}

async function ensureUser(email: string, plainPassword: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });
}

async function ensureMembership(userId: number, organizationId: number, role: UserRole) {
  return prisma.organizationUser.upsert({
    where: {
      userId_organizationId: { userId, organizationId },
    },
    update: { role },
    create: { userId, organizationId, role },
  });
}

async function main() {
  const organization = await ensureOrganization();

  const adminUser = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD);
  const demoUser = await ensureUser(DEMO_EMAIL, DEMO_PASSWORD);

  // If organization was created with temporary ownerId, set it now.
  if (organization.ownerId === 0) {
    await prisma.organization.update({
      where: { id: organization.id },
      data: { ownerId: adminUser.id },
    });
  }

  await ensureMembership(adminUser.id, organization.id, UserRole.OWNER);
  await ensureMembership(demoUser.id, organization.id, UserRole.MEMBER);

  console.log('Seed completed. Accounts:');
  console.log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Demo : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
