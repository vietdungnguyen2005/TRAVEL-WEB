import { prisma } from '../../lib/prisma';

export async function listHeroImages() {
    return prisma.heroImage.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }],
    });
}
