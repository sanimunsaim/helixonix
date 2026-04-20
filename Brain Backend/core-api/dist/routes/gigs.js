/**
 * Gigs Routes — CRUD, publish, packages
 */
import { z } from 'zod';
import { verifyJwt } from '../middleware/auth.js';
import { requireSeller } from '../middleware/rbac.js';
import { db } from '../lib/db.js';
import { gigs, gigPackages, gigAddons } from '../schemas/db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { Queue } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import { publishEvent } from '../lib/events.js';
const searchIndexQueue = new Queue('search-indexing', { connection: bullmqConnection });
const packageSchema = z.object({
    package_type: z.enum(['basic', 'standard', 'premium']),
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    price: z.number().min(100), // cents
    delivery_days: z.number().int().min(1).max(365),
    revisions: z.number().int().min(0).max(20),
    features: z.array(z.string()).max(10),
});
const gigCreateSchema = z.object({
    title: z.string().min(10).max(255),
    description: z.string().min(50).max(10000),
    category: z.string().min(1).max(100),
    subcategory: z.string().max(100).optional(),
    tags: z.array(z.string()).min(1).max(15),
    packages: z.array(packageSchema).min(1).max(3),
    addons: z.array(z.object({
        title: z.string().min(3).max(100),
        description: z.string().max(500).optional(),
        price: z.number().min(100),
        delivery_days: z.number().int().min(0),
    })).max(5).optional(),
    thumbnail_url: z.string().url().optional(),
});
export async function gigRoutes(app) {
    app.get('/', async (request, reply) => {
        const { category = '', page = '1' } = request.query;
        const p = parseInt(page, 10) || 1;
        const list = await db.select().from(gigs)
            .where(eq(gigs.status, 'active'))
            .orderBy(desc(gigs.ordersCount))
            .limit(24).offset((p - 1) * 24);
        return reply.send({ success: true, data: list });
    });
    app.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const gig = await db.query.gigs.findFirst({
            where: eq(gigs.id, id),
            with: { seller: { columns: { id: true, username: true, displayName: true, avatarUrl: true, sellerLevel: true, avgRating: true, completedOrders: true } } },
        });
        if (!gig)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Gig not found' } });
        const packages = await db.select().from(gigPackages).where(eq(gigPackages.gigId, id));
        const addons = await db.select().from(gigAddons).where(eq(gigAddons.gigId, id));
        return reply.send({ success: true, data: { ...gig, packages, addons } });
    });
    app.post('/', { preHandler: [verifyJwt, requireSeller] }, async (request, reply) => {
        const body = gigCreateSchema.parse(request.body);
        const slug = `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}-${Date.now()}`;
        const basicPkg = body.packages.find(p => p.package_type === 'basic');
        const stdPkg = body.packages.find(p => p.package_type === 'standard');
        const premPkg = body.packages.find(p => p.package_type === 'premium');
        const [gig] = await db.insert(gigs).values({
            sellerId: request.user.userId,
            title: body.title,
            slug,
            description: body.description,
            category: body.category,
            subcategory: body.subcategory,
            tags: body.tags,
            basicPrice: basicPkg?.price ?? 0,
            standardPrice: stdPkg?.price,
            premiumPrice: premPkg?.price,
            thumbnailUrl: body.thumbnail_url,
            status: 'draft',
        }).returning();
        // Insert packages
        if (body.packages.length > 0) {
            await db.insert(gigPackages).values(body.packages.map(p => ({
                gigId: gig.id,
                packageType: p.package_type,
                name: p.name,
                description: p.description,
                price: p.price,
                deliveryDays: p.delivery_days,
                revisions: p.revisions,
                features: p.features,
            })));
        }
        // Insert addons
        if (body.addons && body.addons.length > 0) {
            await db.insert(gigAddons).values(body.addons.map(a => ({
                gigId: gig.id,
                title: a.title,
                description: a.description,
                price: a.price,
                deliveryDays: a.delivery_days,
            })));
        }
        return reply.status(201).send({ success: true, data: gig });
    });
    app.post('/:id/publish', { preHandler: [verifyJwt, requireSeller] }, async (request, reply) => {
        const { id } = request.params;
        const gig = await db.query.gigs.findFirst({ where: and(eq(gigs.id, id), eq(gigs.sellerId, request.user.userId)) });
        if (!gig)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Gig not found' } });
        const [updated] = await db.update(gigs)
            .set({ status: 'active', publishedAt: new Date() })
            .where(eq(gigs.id, id))
            .returning();
        await searchIndexQueue.add('index-gig', { entityType: 'gig', entityId: id, operation: 'upsert' });
        await publishEvent('gig.published', { gigId: id, sellerId: request.user.userId });
        return reply.send({ success: true, data: updated });
    });
    app.get('/my', { preHandler: [verifyJwt, requireSeller] }, async (request, reply) => {
        const myGigs = await db.select().from(gigs)
            .where(eq(gigs.sellerId, request.user.userId))
            .orderBy(desc(gigs.createdAt));
        return reply.send({ success: true, data: myGigs });
    });
}
//# sourceMappingURL=gigs.js.map