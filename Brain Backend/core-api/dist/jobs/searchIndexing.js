/**
 * BullMQ Worker — Search Indexing (Typesense)
 * Indexes assets and gigs on create/update/delete
 */
import { Worker } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import { upsertDocument, deleteDocument, COLLECTIONS } from '../lib/typesense.js';
import { db } from '../lib/db.js';
import { assets, gigs, users } from '../schemas/db/index.js';
import { eq } from 'drizzle-orm';
async function processSearchIndexing(job) {
    const { entityType, entityId, operation } = job.data;
    if (operation === 'delete') {
        const collection = entityType === 'asset' ? COLLECTIONS.ASSETS : entityType === 'gig' ? COLLECTIONS.GIGS : COLLECTIONS.SELLERS;
        await deleteDocument(collection, entityId);
        return;
    }
    if (entityType === 'asset') {
        const asset = await db.query.assets.findFirst({ where: eq(assets.id, entityId) });
        if (!asset || asset.status !== 'approved')
            return;
        const seller = await db.query.users.findFirst({ where: eq(users.id, asset.sellerId) });
        await upsertDocument(COLLECTIONS.ASSETS, {
            id: asset.id,
            title: asset.title,
            slug: asset.slug,
            description: asset.description ?? '',
            type: asset.type,
            category: asset.category,
            subcategory: asset.subcategory ?? '',
            tags: asset.tags ?? [],
            license_type: asset.licenseType,
            price: asset.price / 100,
            is_free: asset.isFree,
            seller_id: asset.sellerId,
            seller_name: seller?.displayName ?? '',
            seller_level: seller?.sellerLevel ?? 'new',
            download_count: asset.downloadCount,
            favorite_count: asset.favoriteCount,
            quality_score: asset.qualityScore ?? 0,
            status: asset.status,
            created_at: Math.floor(new Date(asset.createdAt).getTime() / 1000),
        });
    }
    if (entityType === 'gig') {
        const gig = await db.query.gigs.findFirst({ where: eq(gigs.id, entityId) });
        if (!gig || gig.status !== 'active')
            return;
        const seller = await db.query.users.findFirst({ where: eq(users.id, gig.sellerId) });
        await upsertDocument(COLLECTIONS.GIGS, {
            id: gig.id,
            title: gig.title,
            slug: gig.slug,
            description: gig.description,
            category: gig.category,
            subcategory: gig.subcategory ?? '',
            tags: gig.tags ?? [],
            seller_id: gig.sellerId,
            seller_name: seller?.displayName ?? '',
            seller_level: seller?.sellerLevel ?? 'new',
            min_price: gig.basicPrice / 100,
            avg_rating: gig.avgRating,
            orders_count: gig.ordersCount,
            status: gig.status,
            created_at: Math.floor(new Date(gig.createdAt).getTime() / 1000),
        });
    }
    if (entityType === 'seller') {
        const seller = await db.query.users.findFirst({ where: eq(users.id, entityId) });
        if (!seller || !seller.isSeller)
            return;
        await upsertDocument(COLLECTIONS.SELLERS, {
            id: seller.id,
            username: seller.username,
            display_name: seller.displayName,
            bio: seller.bio ?? '',
            skills: seller.skills ?? [],
            level: seller.sellerLevel ?? 'new',
            avg_rating: parseFloat(seller.avgRating ?? '0'),
            total_orders_completed: seller.completedOrders,
            verification_status: seller.sellerVerified ? 'verified' : 'unverified',
        });
    }
}
export function startSearchIndexingWorker() {
    return new Worker('search-indexing', processSearchIndexing, {
        connection: bullmqConnection, concurrency: 5,
    });
}
//# sourceMappingURL=searchIndexing.js.map