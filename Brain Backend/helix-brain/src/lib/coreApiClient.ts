/**
 * Core API Client
 * All data reads/writes go through the HelixOnix Core API — no direct DB access
 * Implements retry logic with exponential backoff
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from './logger';

const CORE_API_BASE = process.env.CORE_API_BASE_URL || 'https://api.helixonix.com/v1';
const CORE_API_KEY = process.env.CORE_API_KEY || '';
const TIMEOUT_MS = parseInt(process.env.CORE_API_TIMEOUT_MS || '30000', 10);
const MAX_RETRIES = 3;

let client: AxiosInstance | null = null;

/**
 * Get or create Core API client (singleton)
 */
export function getCoreApiClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: CORE_API_BASE,
      timeout: TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Key': CORE_API_KEY,
        'X-Service-Name': 'helix-brain',
      },
    });

    // Request interceptor
    client.interceptors.request.use((config) => {
      logger.debug(
        { method: config.method, url: config.url },
        'Core API request'
      );
      return config;
    });

    // Response interceptor
    client.interceptors.response.use(
      (response) => {
        logger.debug(
          { status: response.status, url: response.config.url },
          'Core API response'
        );
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config;
        if (!config) return Promise.reject(error);

        // @ts-expect-error - adding retry count to config
        const retryCount = config.__retryCount || 0;

        if (
          retryCount < MAX_RETRIES &&
          (error.response?.status === 429 ||
            error.response?.status === 500 ||
            error.response?.status === 502 ||
            error.response?.status === 503 ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT')
        ) {
          // @ts-expect-error
          config.__retryCount = retryCount + 1;
          const delay = 1000 * Math.pow(2, retryCount);

          logger.warn(
            { attempt: retryCount + 1, delay, url: config.url },
            'Core API call failed, retrying...'
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          return client!.request(config);
        }

        logger.error(
          {
            status: error.response?.status,
            url: config.url,
            method: config.method,
            message: error.message,
          },
          'Core API call failed (max retries reached)'
        );

        return Promise.reject(error);
      }
    );
  }

  return client;
}

/**
 * Generic GET request to Core API
 */
export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const response = await getCoreApiClient().get<T>(path, { params });
  return response.data;
}

/**
 * Generic POST request to Core API
 */
export async function apiPost<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  const response = await getCoreApiClient().post<T>(path, data);
  return response.data;
}

/**
 * Generic PUT request to Core API
 */
export async function apiPut<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  const response = await getCoreApiClient().put<T>(path, data);
  return response.data;
}

/**
 * Generic PATCH request to Core API
 */
export async function apiPatch<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  const response = await getCoreApiClient().patch<T>(path, data);
  return response.data;
}

/**
 * Generic DELETE request to Core API
 */
export async function apiDelete<T>(path: string): Promise<T> {
  const response = await getCoreApiClient().delete<T>(path);
  return response.data;
}

/**
 * Check Core API health
 */
export async function isCoreApiHealthy(): Promise<boolean> {
  try {
    await getCoreApiClient().get('/health');
    return true;
  } catch {
    return false;
  }
}
