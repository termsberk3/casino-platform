import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameEntity } from '../games/entities/game.entity';
import { UserFavoriteGameEntity } from './entities/user-favorite-game.entity';

interface FavoriteGamesResponse {
  items: GameEntity[];
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(UserFavoriteGameEntity)
    private readonly favoriteRepository: Repository<UserFavoriteGameEntity>,

    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
  ) {}

  async addFavorite(
    userId: string,
    gameId: string,
  ): Promise<{ success: true }> {
    this.ensurePositiveBigIntId(gameId);

    const game = await this.gameRepository.findOne({
      where: {
        id: gameId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game could not be found');
    }

    await this.favoriteRepository.upsert(
      {
        userId,
        gameId,
      },
      {
        conflictPaths: ['userId', 'gameId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return {
      success: true,
    };
  }

  async removeFavorite(
    userId: string,
    gameId: string,
  ): Promise<{ success: true }> {
    this.ensurePositiveBigIntId(gameId);

    await this.favoriteRepository.delete({
      userId,
      gameId,
    });

    return {
      success: true,
    };
  }

  async findMyFavorites(userId: string): Promise<FavoriteGamesResponse> {
    const favorites = await this.favoriteRepository.find({
      where: {
        userId,
      },
      relations: {
        game: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      items: favorites
        .map((favorite) => favorite.game)
        .filter((game) => game.isActive),
    };
  }

  private ensurePositiveBigIntId(id: string): void {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('Invalid game id');
    }
  }
}
