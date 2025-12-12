const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTemplates() {
    const templates = [
        {
            name: 'Fashion Product Shot',
            description: 'Standard fashion product photography template',
            category: 'fashion',
            template: 'A professional fashion photograph of {product} worn by {model}, {scene}, {lighting}, {style}',
            variables: ['product', 'model', 'scene', 'lighting', 'style'],
            isActive: true,
            isGlobal: true
        },
        {
            name: 'E-commerce White Background',
            description: 'Clean e-commerce product shot on white background',
            category: 'ecommerce',
            template: '{product} on pure white background, professional product photography, studio lighting, high detail, commercial quality',
            variables: ['product'],
            isActive: true,
            isGlobal: true
        },
        {
            name: 'Lifestyle Fashion',
            description: 'Lifestyle fashion photography in natural setting',
            category: 'lifestyle',
            template: '{model} wearing {product} in {scene}, natural lighting, lifestyle photography, candid moment, editorial style',
            variables: ['model', 'product', 'scene'],
            isActive: true,
            isGlobal: true
        },
        {
            name: 'Luxury Brand',
            description: 'High-end luxury brand aesthetic',
            category: 'luxury',
            template: 'Luxurious {product} photographed in {scene}, {model} with elegant pose, dramatic lighting, high fashion editorial, Vogue style',
            variables: ['product', 'scene', 'model'],
            isActive: true,
            isGlobal: true
        },
        {
            name: 'Streetwear Urban',
            description: 'Urban streetwear style photography',
            category: 'streetwear',
            template: '{model} in {product}, urban city background, street style photography, dynamic pose, natural daylight, contemporary fashion',
            variables: ['model', 'product'],
            isActive: true,
            isGlobal: true
        }
    ];

    for (let i = 0; i < templates.length; i++) {
        const t = templates[i];
        await prisma.promptTemplate.upsert({
            where: { id: i + 1 },
            update: {},
            create: {
                name: t.name,
                description: t.description,
                category: t.category,
                template: t.template,
                variables: t.variables,
                isActive: t.isActive,
                isGlobal: t.isGlobal
            }
        });
        console.log('Template created:', t.name);
    }
}

seedTemplates()
    .then(function () { console.log('Templates seed completed!'); return prisma.$disconnect(); })
    .catch(function (e) { console.error(e); prisma.$disconnect(); process.exit(1); });
