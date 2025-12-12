const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateKieModel() {
    const result = await prisma.aiProviderConfig.updateMany({
        where: { provider: 'KIE' },
        data: { modelId: 'google/nano-banana' }
    });
    console.log('Updated KIE providers:', result.count);
}

updateKieModel()
    .then(function () { console.log('Done!'); return prisma.$disconnect(); })
    .catch(function (e) { console.error(e); prisma.$disconnect(); process.exit(1); });
