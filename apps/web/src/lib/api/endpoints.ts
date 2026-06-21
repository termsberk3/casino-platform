import type {
    AuthResponse,
    CurrencyConversionResponse,
    FavoriteGamesResponse,
    Game,
    MyBalanceConversionResponse,
    PaginatedGamesResponse,
    PublicUser,
    SpinHistoryResponse,
    SpinResponse,
} from '@/types/api';

import { apiRequest } from './api-client';

export function register(input: {
    email: string;
    password: string;
    displayName?: string;
}): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function getGameById(
    gameId: string,
): Promise<Game> {
    return apiRequest<Game>(`/games/${gameId}`);
}

export function login(input: {
    email: string;
    password: string;
}): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function logout(input: {
    refreshToken: string;
}): Promise<{ success: true }> {
    return apiRequest<{ success: true }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function getMe(): Promise<PublicUser> {
    return apiRequest<PublicUser>('/auth/me', {
        auth: true,
    });
}

export function listGames(input: {
    page?: number;
    limit?: number;
    provider?: string;
}): Promise<PaginatedGamesResponse> {
    const params = new URLSearchParams();

    params.set('page', String(input.page || 1));
    params.set('limit', String(input.limit || 20));

    if (input.provider) {
        params.set('provider', input.provider);
    }

    return apiRequest<PaginatedGamesResponse>(
        `/games?${params.toString()}`,
    );
}

export function searchGames(input: {
    q: string;
    page?: number;
    limit?: number;
    provider?: string;
}): Promise<PaginatedGamesResponse> {
    const params = new URLSearchParams();

    params.set('q', input.q);
    params.set('page', String(input.page || 1));
    params.set('limit', String(input.limit || 20));

    if (input.provider) {
        params.set('provider', input.provider);
    }

    return apiRequest<PaginatedGamesResponse>(
        `/games/search?${params.toString()}`,
    );
}

export function addFavorite(
    gameId: string,
): Promise<{ success: true }> {
    return apiRequest<{ success: true }>(
        `/games/${gameId}/favorite`,
        {
            method: 'POST',
            auth: true,
        },
    );
}

export function removeFavorite(
    gameId: string,
): Promise<{ success: true }> {
    return apiRequest<{ success: true }>(
        `/games/${gameId}/favorite`,
        {
            method: 'DELETE',
            auth: true,
        },
    );
}

export function getMyFavorites(): Promise<FavoriteGamesResponse> {
    return apiRequest<FavoriteGamesResponse>(
        '/users/me/favorites',
        {
            auth: true,
        },
    );
}

export function createSpin(input: {
    gameId?: string;
    betAmount: string;
    idempotencyKey: string;
}): Promise<SpinResponse> {
    return apiRequest<SpinResponse>('/spins', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(input),
    });
}

export function getSpinHistory(): Promise<SpinHistoryResponse> {
    return apiRequest<SpinHistoryResponse>('/spins/history', {
        auth: true,
    });
}

export function convertCurrency(input: {
    amount: string;
    from: string;
    to: string;
}): Promise<CurrencyConversionResponse> {
    const params = new URLSearchParams();

    params.set('amount', input.amount);
    params.set('from', input.from);
    params.set('to', input.to);

    return apiRequest<CurrencyConversionResponse>(
        `/currency/convert?${params.toString()}`,
    );
}

export function convertMyBalance(
    to: string,
): Promise<MyBalanceConversionResponse> {
    const params = new URLSearchParams();

    params.set('to', to);

    return apiRequest<MyBalanceConversionResponse>(
        `/currency/me?${params.toString()}`,
        {
            auth: true,
        },
    );
}