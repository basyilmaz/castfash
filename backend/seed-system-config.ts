import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CAMERA_ANGLES = [
    { value: "eye_level", label: "Göz Hizası", prompt: "eye level shot" },
    { value: "low_angle", label: "Aşağıdan", prompt: "low angle shot, looking up" },
    { value: "high_angle", label: "Yukarıdan", prompt: "high angle shot, looking down" },
    { value: "side_profile", label: "Yan Profil", prompt: "side profile shot" },
];

const SHOT_TYPES = [
    { value: "full_body", label: "Tam Boy", prompt: "full body shot, wide angle" },
    { value: "knee_shot", label: "Diz Üstü", prompt: "knee level shot, three quarter body" },
    { value: "waist_up", label: "Bel Üstü", prompt: "waist up shot, medium shot" },
    { value: "close_up", label: "Yakın Çekim", prompt: "close up portrait" },
];

const MODEL_POSES = [
    { value: "standing", label: "Ayakta", prompt: "standing pose, fashion stance" },
    { value: "walking", label: "Yürürken", prompt: "walking pose, dynamic movement, clothes in motion" },
    { value: "sitting", label: "Otururken", prompt: "sitting pose, relaxed" },
    { value: "leaning", label: "Yaslanmış", prompt: "leaning against wall pose" },
];

async function main() {
    await prisma.systemConfig.upsert({
        where: { key: 'CAMERA_ANGLES' },
        update: { value: CAMERA_ANGLES },
        create: { key: 'CAMERA_ANGLES', value: CAMERA_ANGLES, description: 'Kamera açıları ve prompt karşılıkları' },
    });

    await prisma.systemConfig.upsert({
        where: { key: 'SHOT_TYPES' },
        update: { value: SHOT_TYPES },
        create: { key: 'SHOT_TYPES', value: SHOT_TYPES, description: 'Çekim türleri ve prompt karşılıkları' },
    });

    await prisma.systemConfig.upsert({
        where: { key: 'MODEL_POSES' },
        update: { value: MODEL_POSES },
        create: { key: 'MODEL_POSES', value: MODEL_POSES, description: 'Model pozları ve prompt karşılıkları' },
    });

    console.log('System config seeded.');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
