/**
 * Typesense Search Client
 * Manages collections for assets, gigs, and sellers
 */
export declare const typesenseClient: import("typesense").Client;
export declare const typesenseSearchClient: import("typesense").Client;
export declare const COLLECTIONS: {
    readonly ASSETS: "assets";
    readonly GIGS: "gigs";
    readonly SELLERS: "sellers";
};
export declare function initializeCollections(): Promise<void>;
export declare function upsertDocument(collection: string, document: Record<string, unknown>): Promise<void>;
export declare function deleteDocument(collection: string, id: string): Promise<void>;
export declare function searchDocuments(collection: string, params: {
    q: string;
    query_by?: string;
    query_by_weights?: string;
    filter_by?: string;
    sort_by?: string;
    page?: number;
    per_page?: number;
    facet_by?: string;
}): Promise<import("typesense/lib/Typesense/Documents.js").SearchResponse<object>>;
export declare function pingTypesense(): Promise<boolean>;
//# sourceMappingURL=typesense.d.ts.map