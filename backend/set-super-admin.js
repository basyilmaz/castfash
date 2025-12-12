const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const result = await prisma.user.update({
        where: { email: 'sectest@test.com' },
        data: { isSuperAdmin: true },
    });
    console.log('Updated user:', result);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
