export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}

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
