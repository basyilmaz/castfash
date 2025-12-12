const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seed() {
    const hash = await bcrypt.hash('Castfash!2024', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'founder@castfash.com' },
        update: {},
        create: {
            email: 'founder@castfash.com',
            passwordHash: hash,
            isSuperAdmin: true
        }
    });
    console.log('Admin created:', admin.email);

    const org = await prisma.organization.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Castfash Studio',
            ownerId: admin.id,
            remainingCredits: 200
        }
    });
    console.log('Organization created:', org.name);

    await prisma.organizationUser.upsert({
        where: { userId_organizationId: { userId: admin.id, organizationId: org.id } },
        update: {},
        create: {
            userId: admin.id,
            organizationId: org.id,
            role: 'OWNER'
        }
    });
    console.log('User linked to organization');
}

seed()
    .then(function () { console.log('Seed completed!'); return prisma.$disconnect(); })
    .catch(function (e) { console.error(e); prisma.$disconnect(); process.exit(1); });
