export interface PublicUser {
    id: string;
    email: string;
    displayName: string | null;
    balance: string;
}

export interface AuthResponse {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
}

export interface Game {
    id: string;
    externalId: string | null;
    name: string;
    providerName: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string;
    isActive: boolean;
}

export interface Pagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

export interface PaginatedGamesResponse {
    items: Game[];
    pagination: Pagination;
}

export interface FavoriteGamesResponse {
    items: Game[];
}

export interface SpinResponse {
    spinId: string;
    reels: [string, string, string];
    betAmount: string;
    grossWinnings: string;
    netResult: string;
    payoutMultiplier: string;
    balanceBefore: string;
    balanceAfter: string;
}

export interface SpinHistoryItem {
    id: string;
    userId: string;
    gameId: string | null;
    reel1: string;
    reel2: string;
    reel3: string;
    betAmount: string;
    grossWinnings: string;
    netResult: string;
    payoutMultiplier: string;
    balanceBefore: string;
    balanceAfter: string;
    idempotencyKey: string;
    createdAt: string;
}

export interface SpinHistoryResponse {
    items: SpinHistoryItem[];
}

export interface CurrencyConversionResponse {
    amount: string;
    from: string;
    to: string;
    rate: string;
    convertedAmount: string;
    rateDate: string | null;
    cached: boolean;
}

export interface MyBalanceConversionResponse {
    balance: {
        amount: string;
        currency: string;
    };
    convertedBalance: {
        amount: string;
        currency: string;
    };
    rate: string;
    rateDate: string | null;
    cached: boolean;
}

export interface ApiErrorBody {
    statusCode: number;
    message: string | string[];
    error: string;
    path: string;
    method: string;
    timestamp: string;
}