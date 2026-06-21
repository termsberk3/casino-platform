import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { DataSource } from 'typeorm';

import { GameEntity } from '../games/entities/game.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateSpinDto } from './dto/create-spin.dto';
import { SpinHistoryEntity } from './entities/spin-history.entity';
import { calculateSpinResult, normalizeCoinAmount } from './slot/slot-machine';

interface SpinResponse {
  spinId: string;
  reels: [string, string, string];
  betAmount: string;
  grossWinnings: string;
  netResult: string;
  payoutMultiplier: string;
  balanceBefore: string;
  balanceAfter: string;
}

interface SpinHistoryResponse {
  items: SpinHistoryEntity[];
}

@Injectable()
export class SpinsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createSpin(userId: string, dto: CreateSpinDto): Promise<SpinResponse> {
    const betAmount = new Decimal(dto.betAmount);

    return this.dataSource.transaction(async (manager) => {
      const existingSpin = await manager.findOne(SpinHistoryEntity, {
        where: {
          userId,
          idempotencyKey: dto.idempotencyKey,
        },
      });

      if (existingSpin) {
        throw new ConflictException('Spin request has already been processed');
      }

      const user = await manager
        .createQueryBuilder(UserEntity, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw new NotFoundException('User could not be found');
      }

      if (dto.gameId) {
        const game = await manager.findOne(GameEntity, {
          where: {
            id: dto.gameId,
            isActive: true,
          },
          select: {
            id: true,
          },
        });

        if (!game) {
          throw new NotFoundException('Game could not be found');
        }
      }

      const balanceBefore = new Decimal(user.balance);

      if (balanceBefore.lessThan(betAmount)) {
        throw new BadRequestException('Insufficient balance');
      }

      const spinResult = calculateSpinResult(betAmount);

      const balanceAfter = balanceBefore
        .minus(betAmount)
        .plus(spinResult.grossWinnings);

      user.balance = normalizeCoinAmount(balanceAfter);

      await manager.save(UserEntity, user);

      const spin = manager.create(SpinHistoryEntity, {
        userId,
        gameId: dto.gameId ?? null,
        reel1: spinResult.reels[0],
        reel2: spinResult.reels[1],
        reel3: spinResult.reels[2],
        betAmount: normalizeCoinAmount(betAmount),
        grossWinnings: normalizeCoinAmount(spinResult.grossWinnings),
        netResult: normalizeCoinAmount(spinResult.netResult),
        payoutMultiplier: spinResult.payoutMultiplier.toFixed(2),
        balanceBefore: normalizeCoinAmount(balanceBefore),
        balanceAfter: normalizeCoinAmount(balanceAfter),
        idempotencyKey: dto.idempotencyKey,
      });

      const savedSpin = await manager.save(SpinHistoryEntity, spin);

      return {
        spinId: savedSpin.id,
        reels: [savedSpin.reel1, savedSpin.reel2, savedSpin.reel3],
        betAmount: savedSpin.betAmount,
        grossWinnings: savedSpin.grossWinnings,
        netResult: savedSpin.netResult,
        payoutMultiplier: savedSpin.payoutMultiplier,
        balanceBefore: savedSpin.balanceBefore,
        balanceAfter: savedSpin.balanceAfter,
      };
    });
  }

  async findMyHistory(userId: string): Promise<SpinHistoryResponse> {
    const items = await this.dataSource.getRepository(SpinHistoryEntity).find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 50,
    });

    return {
      items,
    };
  }
}
