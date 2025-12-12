const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTemplates() {
    const templates = [
        {
            name: 'Fashion Product Shot',
            type: 'MASTER',
            category: 'PRODUCT',
            content: 'A professional fashion photograph of {product} worn by {model}, {scene}, {lighting}, {style}',
            variables: { keys: ['product', 'model', 'scene', 'lighting', 'style'] },
            isActive: true,
            priority: 1,
            tags: ['fashion', 'product']
        },
        {
            name: 'E-commerce White Background',
            type: 'SCENE',
            category: 'BACKGROUND',
            content: '{product} on pure white background, professional product photography, studio lighting, high detail, commercial quality',
            variables: { keys: ['product'] },
            isActive: true,
            priority: 2,
            tags: ['ecommerce', 'white']
        },
        {
            name: 'Lifestyle Fashion',
            type: 'MASTER',
            category: 'GENERAL',
            content: '{model} wearing {product} in {scene}, natural lighting, lifestyle photography, candid moment, editorial style',
            variables: { keys: ['model', 'product', 'scene'] },
            isActive: true,
            priority: 3,
            tags: ['lifestyle', 'casual']
        },
        {
            name: 'Luxury Brand',
            type: 'MASTER',
            category: 'QUALITY',
            content: 'Luxurious {product} photographed in {scene}, {model} with elegant pose, dramatic lighting, high fashion editorial, Vogue style',
            variables: { keys: ['product', 'scene', 'model'] },
            isActive: true,
            priority: 4,
            tags: ['luxury', 'highend']
        },
        {
            name: 'Model Pose Guide',
            type: 'POSE',
            category: 'MODEL',
            content: '{model} in {product}, confident pose, looking at camera, professional modeling, fashion catalog style',
            variables: { keys: ['model', 'product'] },
            isActive: true,
            priority: 5,
            tags: ['model', 'pose']
        }
    ];

    for (let i = 0; i < templates.length; i++) {
        const t = templates[i];
        await prisma.promptTemplate.upsert({
            where: { id: i + 1 },
            update: {},
            create: {
                name: t.name,
                type: t.type,
                category: t.category,
                content: t.content,
                variables: t.variables,
                isActive: t.isActive,
                priority: t.priority,
                tags: t.tags
            }
        });
        console.log('Template created:', t.name);
    }
}

seedTemplates()
    .then(function () { console.log('Templates seed completed!'); return prisma.$disconnect(); })
    .catch(function (e) { console.error(e); prisma.$disconnect(); process.exit(1); });
