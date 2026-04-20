/**
 * Typesense Search Client
 * Manages collections for assets, gigs, and sellers
 */

import Typesense from 'typesense';
import { config } from '../config.js';

export const typesenseClient = new Typesense.Client({
  nodes: [{ host: config.TYPESENSE_HOST, port: config.TYPESENSE_PORT, protocol: config.TYPESENSE_PROTOCOL }],
  apiKey: config.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});

export const typesenseSearchClient = new Typesense.Client({
  nodes: [{ host: config.TYPESENSE_HOST, port: config.TYPESENSE_PORT, protocol: config.TYPESENSE_PROTOCOL }],
  apiKey: config.TYPESENSE_SEARCH_ONLY_KEY ?? config.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});

export const COLLECTIONS = { ASSETS: 'assets', GIGS: 'gigs', SELLERS: 'sellers' } as const;

export async function initializeCollections(): Promise<void> {
  const schemas = [
    {
      name: COLLECTIONS.ASSETS,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'slug', type: 'string', index: false },
        { name: 'description', type: 'string', optional: true },
        { name: 'type', type: 'string', facet: true },
        { name: 'category', type: 'string', facet: true },
        { name: 'subcategory', type: 'string', facet: true, optional: true },
        { name: 'tags', type: 'string[]', facet: true },
        { name: 'license_type', type: 'string', facet: true },
        { name: 'price', type: 'float', facet: true },
        { name: 'is_free', type: 'bool', facet: true },
        { name: 'seller_id', type: 'string', facet: true },
        { name: 'seller_name', type: 'string' },
        { name: 'seller_level', type: 'string', facet: true },
        { name: 'download_count', type: 'int32', sort: true },
        { name: 'favorite_count', type: 'int32', sort: true },
        { name: 'quality_score', type: 'float', sort: true },
        { name: 'status', type: 'string', facet: true },
        { name: 'created_at', type: 'int64', sort: true },
      ],
      default_sorting_field: 'download_count',
    },
    {
      name: COLLECTIONS.GIGS,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'slug', type: 'string', index: false },
        { name: 'description', type: 'string', optional: true },
        { name: 'category', type: 'string', facet: true },
        { name: 'subcategory', type: 'string', facet: true, optional: true },
        { name: 'tags', type: 'string[]', facet: true },
        { name: 'seller_id', type: 'string', facet: true },
        { name: 'seller_name', type: 'string' },
        { name: 'seller_level', type: 'string', facet: true },
        { name: 'min_price', type: 'float', facet: true, sort: true },
        { name: 'avg_rating', type: 'float', sort: true },
        { name: 'orders_count', type: 'int32', sort: true },
        { name: 'status', type: 'string', facet: true },
        { name: 'created_at', type: 'int64', sort: true },
      ],
      default_sorting_field: 'orders_count',
    },
    {
      name: COLLECTIONS.SELLERS,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'username', type: 'string' },
        { name: 'display_name', type: 'string' },
        { name: 'bio', type: 'string', optional: true },
        { name: 'skills', type: 'string[]', facet: true },
        { name: 'level', type: 'string', facet: true },
        { name: 'avg_rating', type: 'float', sort: true },
        { name: 'total_orders_completed', type: 'int32', sort: true },
        { name: 'verification_status', type: 'string', facet: true },
      ],
      default_sorting_field: 'avg_rating',
    },
  ];

  for (const schema of schemas) {
    try {
      await typesenseClient.collections(schema.name).retrieve();
    } catch {
      await typesenseClient.collections().create(schema as any);
      console.log(`[Typesense] Created collection: ${schema.name}`);
    }
  }
}

export async function upsertDocument(collection: string, document: Record<string, unknown>): Promise<void> {
  await typesenseClient.collections(collection).documents().upsert(document);
}

export async function deleteDocument(collection: string, id: string): Promise<void> {
  await typesenseClient.collections(collection).documents(id).delete();
}

export async function searchDocuments(collection: string, params: {
  q: string;
  query_by?: string;
  query_by_weights?: string;
  filter_by?: string;
  sort_by?: string;
  page?: number;
  per_page?: number;
  facet_by?: string;
}) {
  return typesenseSearchClient.collections(collection).documents().search({
    q: params.q || '*',
    query_by: params.query_by ?? 'title,tags,description',
    query_by_weights: params.query_by_weights ?? '5,3,1',
    filter_by: params.filter_by,
    sort_by: params.sort_by ?? '_text_match:desc',
    page: params.page ?? 1,
    per_page: params.per_page ?? 24,
    facet_by: params.facet_by,
    highlight_full_fields: 'title',
    typo_tokens_threshold: 1,
  } as any);
}

export async function pingTypesense(): Promise<boolean> {
  try {
    await typesenseClient.health.retrieve();
    return true;
  } catch {
    return false;
  }
}
