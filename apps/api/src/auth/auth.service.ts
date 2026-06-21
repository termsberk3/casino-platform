import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import type {
  AccessTokenPayload,
  AuthResponse,
  PublicUser,
} from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const tokenHash = this.hashRefreshToken(dto.refreshToken);

    const existingToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
      },
      relations: {
        user: true,
      },
    });

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (existingToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    existingToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(existingToken);

    return this.createAuthResponse(existingToken.user);
  }

  async logout(dto: RefreshTokenDto): Promise<{ success: true }> {
    const tokenHash = this.hashRefreshToken(dto.refreshToken);

    const existingToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
      },
    });

    if (existingToken && !existingToken.revokedAt) {
      existingToken.revokedAt = new Date();

      await this.refreshTokenRepository.save(existingToken);
    }

    return {
      success: true,
    };
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);

    return this.toPublicUser(user);
  }

  private async createAuthResponse(user: UserEntity): Promise<AuthResponse> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);

    return {
      user: this.toPublicUser(user),
      accessToken,
      refreshToken,
    };
  }

  private async signAccessToken(user: UserEntity): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const expiresIn = (this.configService.get<string>('JWT_ACCESS_TTL') ||
      '15m') as JwtSignOptions['expiresIn'];

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn,
    });
  }

  private async createRefreshToken(user: UserEntity): Promise<string> {
    const refreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashRefreshToken(refreshToken);

    const expiresAt = this.getRefreshTokenExpiryDate();

    const tokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });

    await this.refreshTokenRepository.save(tokenEntity);

    return refreshToken;
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiryDate(): Date {
    const ttl = this.configService.get<string>('JWT_REFRESH_TTL') || '7d';

    const now = Date.now();

    if (ttl.endsWith('d')) {
      const days = Number(ttl.replace('d', ''));

      return new Date(now + days * 24 * 60 * 60 * 1000);
    }

    if (ttl.endsWith('h')) {
      const hours = Number(ttl.replace('h', ''));

      return new Date(now + hours * 60 * 60 * 1000);
    }

    if (ttl.endsWith('m')) {
      const minutes = Number(ttl.replace('m', ''));

      return new Date(now + minutes * 60 * 1000);
    }

    throw new Error(
      'JWT_REFRESH_TTL must use d, h, or m suffix. Example: 7d, 12h, 30m',
    );
  }

  private toPublicUser(user: UserEntity): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      balance: user.balance,
    };
  }
}
