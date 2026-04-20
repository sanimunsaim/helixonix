/**
 * Routes — Search
 * GET /search?q=&type=&category=&license=&price_min=&price_max=&sort=&page=
 */
import { searchDocuments, COLLECTIONS } from '../lib/typesense.js';
export async function searchRoutes(app) {
    app.get('/', async (request, reply) => {
        const q = request.query;
        const { query = '', type = '', category = '', subcategory = '', license = '', price_min = '', price_max = '', sort = 'relevance', page = '1', per_page = '24', entity = 'assets', } = q;
        // Build filter string
        const filters = ['status:=approved'];
        if (type)
            filters.push(`type:=${type}`);
        if (category)
            filters.push(`category:=${category}`);
        if (subcategory)
            filters.push(`subcategory:=${subcategory}`);
        if (license)
            filters.push(`license_type:=${license}`);
        if (price_min || price_max) {
            const min = price_min ? parseFloat(price_min) : 0;
            const max = price_max ? parseFloat(price_max) : 99999;
            filters.push(`price:[${min}..${max}]`);
        }
        const filterBy = filters.join(' && ');
        // Build sort
        const sortMap = {
            relevance: '_text_match:desc',
            newest: 'created_at:desc',
            popular: 'download_count:desc',
            price_asc: 'price:asc',
            price_desc: 'price:desc',
            rating: 'quality_score:desc',
        };
        const sortBy = sortMap[sort] ?? '_text_match:desc';
        const collection = entity === 'gigs' ? COLLECTIONS.GIGS : entity === 'sellers' ? COLLECTIONS.SELLERS : COLLECTIONS.ASSETS;
        const results = await searchDocuments(collection, {
            q: query || '*',
            query_by: 'title,tags,description',
            query_by_weights: '5,3,1',
            filter_by: filterBy,
            sort_by: sortBy,
            page: parseInt(page, 10) || 1,
            per_page: Math.min(48, parseInt(per_page, 10) || 24),
            facet_by: 'type,category,license_type',
        });
        return reply.send({ success: true, data: results });
    });
}
//# sourceMappingURL=search.js.map