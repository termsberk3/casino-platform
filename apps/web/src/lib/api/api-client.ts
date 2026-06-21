import type { ApiErrorBody } from '@/types/api';

import {
    getAccessToken,
    getRefreshToken,
    saveTokens,
    clearTokens,
} from '../auth/token-storage';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3001';

interface ApiRequestOptions extends RequestInit {
    auth?: boolean;
    retryOnUnauthorized?: boolean;
}

export class ApiError extends Error {
    statusCode: number;
    body: ApiErrorBody | null;

    constructor(
        message: string,
        statusCode: number,
        body: ApiErrorBody | null,
    ) {
        super(message);

        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const {
        auth = false,
        retryOnUnauthorized = true,
        headers,
        ...requestOptions
    } = options;

    const requestHeaders = new Headers(headers);

    if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    if (auth) {
        const accessToken = getAccessToken();

        if (accessToken) {
            requestHeaders.set(
                'Authorization',
                `Bearer ${accessToken}`,
            );
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestOptions,
        headers: requestHeaders,
    });

    if (
        response.status === 401 &&
        auth &&
        retryOnUnauthorized
    ) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            return apiRequest<T>(path, {
                ...options,
                retryOnUnauthorized: false,
            });
        }
    }

    if (!response.ok) {
        throw await createApiError(response);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        clearTokens();

        return false;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/auth/refresh`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken,
                }),
            },
        );

        if (!response.ok) {
            clearTokens();

            return false;
        }

        const data = (await response.json()) as {
            accessToken: string;
            refreshToken: string;
        };

        saveTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        });

        return true;
    } catch {
        clearTokens();

        return false;
    }
}

async function createApiError(
    response: Response,
): Promise<ApiError> {
    let body: ApiErrorBody | null = null;

    try {
        body = (await response.json()) as ApiErrorBody;
    } catch {
        body = null;
    }

    const message = Array.isArray(body?.message)
        ? body.message.join(', ')
        : body?.message || response.statusText;

    return new ApiError(
        message,
        response.status,
        body,
    );
}