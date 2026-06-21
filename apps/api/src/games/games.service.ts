import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { ListGamesQueryDto } from './dto/list-games-query.dto';
import { SearchGamesQueryDto } from './dto/search-games-query.dto';
import { GameEntity } from './entities/game.entity';

interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedGamesResponse {
  items: GameEntity[];
  pagination: PaginationMetadata;
}

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
  ) {}

  async findAll(query: ListGamesQueryDto): Promise<PaginatedGamesResponse> {
    const { page, limit } = query;

    const queryBuilder = this.createPublicGamesQuery();

    if (query.provider) {
      queryBuilder.andWhere('game.providerName ILIKE :provider', {
        provider: `%${query.provider.trim()}%`,
      });
    }

    return this.getPaginatedResult(queryBuilder, page, limit);
  }

  async search(query: SearchGamesQueryDto): Promise<PaginatedGamesResponse> {
    const { q, page, limit } = query;

    const queryBuilder = this.createPublicGamesQuery();

    queryBuilder.andWhere(
      `(
        game.name ILIKE :search
        OR game.slug ILIKE :search
        OR game.providerName ILIKE :search
      )`,
      {
        search: `%${q}%`,
      },
    );

    if (query.provider) {
      queryBuilder.andWhere('game.providerName ILIKE :provider', {
        provider: `%${query.provider.trim()}%`,
      });
    }

    return this.getPaginatedResult(queryBuilder, page, limit);
  }

  async findOne(id: string): Promise<GameEntity> {
    this.ensureNumericId(id);

    const game = await this.gameRepository.findOne({
      where: {
        id,
        isActive: true,
      },
      // ...
    });

    if (!game) {
      throw new NotFoundException('Game could not be found');
    }

    return game;
  }

  private ensureNumericId(id: string): void {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid game id');
    }
  }

  private createPublicGamesQuery(): SelectQueryBuilder<GameEntity> {
    return this.gameRepository
      .createQueryBuilder('game')
      .select([
        'game.id',
        'game.externalId',
        'game.name',
        'game.providerName',
        'game.slug',
        'game.description',
        'game.thumbnailUrl',
        'game.isActive',
        'game.casinoId',
        'game.gameTypeId',
        'game.createdAt',
        'game.updatedAt',
      ])
      .where('game.isActive = :isActive', {
        isActive: true,
      });
  }

  private async getPaginatedResult(
    queryBuilder: SelectQueryBuilder<GameEntity>,
    page: number,
    limit: number,
  ): Promise<PaginatedGamesResponse> {
    const offset = (page - 1) * limit;

    queryBuilder
      .orderBy('game.name', 'ASC')
      .addOrderBy('game.id', 'ASC')
      .skip(offset)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
