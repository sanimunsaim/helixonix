/**
 * BullMQ Worker — Search Indexing (Typesense)
 * Indexes assets and gigs on create/update/delete
 */
import { Worker } from 'bullmq';
interface SearchIndexJobData {
    entityType: 'asset' | 'gig' | 'seller';
    entityId: string;
    operation: 'upsert' | 'delete';
}
export declare function startSearchIndexingWorker(): Worker<SearchIndexJobData, any, string>;
export {};
//# sourceMappingURL=searchIndexing.d.ts.map