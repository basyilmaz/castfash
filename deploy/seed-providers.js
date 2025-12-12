const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProviders() {
    // KIE Provider
    await prisma.aiProviderConfig.upsert({
        where: { id: 1 },
        update: {},
        create: {
            provider: 'KIE',
            isActive: true,
            priority: 1,
            baseUrl: 'https://api.kie.ai/api/v1/jobs/createTask',
            apiKey: 'bcf8772ff8257377b9665ab112b2c537',
            modelId: 'nano-banana-pro',
            maxRetries: 3,
            timeoutMs: 120000,
            settings: {}
        }
    });
    console.log('KIE Provider created');

    // REPLICATE Provider
    await prisma.aiProviderConfig.upsert({
        where: { id: 2 },
        update: {},
        create: {
            provider: 'REPLICATE',
            isActive: false,
            priority: 2,
            maxRetries: 3,
            timeoutMs: 120000,
            settings: {}
        }
    });
    console.log('REPLICATE Provider created');

    // FAL Provider
    await prisma.aiProviderConfig.upsert({
        where: { id: 3 },
        update: {},
        create: {
            provider: 'FAL',
            isActive: false,
            priority: 3,
            maxRetries: 3,
            timeoutMs: 120000,
            settings: {}
        }
    });
    console.log('FAL Provider created');

    // Prompt presets
    const presets = [
        { name: 'Studio Classic', description: 'Klasik studyo cekimi', scenePrompt: 'clean professional photography studio, white/grey backdrop', posePrompt: 'confident standing pose', lightingPrompt: 'soft studio lighting', stylePrompt: 'editorial fashion photography', negativePrompt: 'harsh shadows, dark areas', tags: ['studio', 'classic'] },
        { name: 'Beach Summer', description: 'Yaz plaj cekimi', scenePrompt: 'sunny tropical beach, crystal clear water', posePrompt: 'relaxed beach pose', lightingPrompt: 'natural sunlight, golden hour', stylePrompt: 'lifestyle photography', negativePrompt: 'cloudy, overcast', tags: ['beach', 'summer'] },
        { name: 'Urban Street', description: 'Sehir sokak cekimi', scenePrompt: 'modern city street, urban architecture', posePrompt: 'walking pose, dynamic movement', lightingPrompt: 'natural daylight', stylePrompt: 'street style photography', negativePrompt: 'rural, nature', tags: ['urban', 'street'] }
    ];

    for (let i = 0; i < presets.length; i++) {
        await prisma.promptPreset.upsert({
            where: { id: i + 1 },
            update: {},
            create: presets[i]
        });
    }
    console.log('Prompt presets created');
}

seedProviders()
    .then(function () { console.log('Provider seed completed!'); return prisma.$disconnect(); })
    .catch(function (e) { console.error(e); prisma.$disconnect(); process.exit(1); });
