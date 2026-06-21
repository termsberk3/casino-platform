import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DataSource, DeepPartial } from 'typeorm';

import { CasinoEntity } from '../../casinos/entities/casino.entity';
import { GameTypeEntity } from '../../game-types/entities/game-type.entity';
import { GameEntity } from '../../games/entities/game.entity';

interface GameDataItem {
  id: number;
  slug: string;
  title: string;
  providerName: string;
  thumb: {
    url: string;
  };
}

function isGameDataItem(value: unknown): value is GameDataItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Partial<GameDataItem>;

  return (
    typeof item.id === 'number' &&
    typeof item.slug === 'string' &&
    typeof item.title === 'string' &&
    typeof item.providerName === 'string' &&
    typeof item.thumb === 'object' &&
    item.thumb !== null &&
    typeof item.thumb.url === 'string'
  );
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

export async function seedGames(dataSource: DataSource): Promise<void> {
  const gameRepository = dataSource.getRepository(GameEntity);
  const casinoRepository = dataSource.getRepository(CasinoEntity);
  const gameTypeRepository = dataSource.getRepository(GameTypeEntity);

  const casino = await casinoRepository.findOneBy({
    slug: 'demo-casino',
  });

  if (!casino) {
    throw new Error(
      'Demo casino could not be found. Please run the casino seed first.',
    );
  }

  const gameType = await gameTypeRepository.findOneBy({
    slug: 'slot',
  });

  if (!gameType) {
    throw new Error(
      'Slot game type could not be found. Please run the game type seed first.',
    );
  }

  const filePath = resolve(process.cwd(), 'data', 'game-data.json');

  const fileContent = await readFile(filePath, 'utf-8');
  const parsedData: unknown = JSON.parse(fileContent);

  if (!Array.isArray(parsedData)) {
    throw new Error('game-data.json file must have an array at its top level.');
  }

  const invalidRows = parsedData.filter((item) => !isGameDataItem(item));

  if (invalidRows.length > 0) {
    throw new Error(`${invalidRows.length} invalid game records found.`);
  }

  const games: DeepPartial<GameEntity>[] = parsedData.map((item) => {
    const game = item as GameDataItem;

    return {
      externalId: String(game.id),
      casinoId: casino.id,
      gameTypeId: gameType.id,
      name: game.title.trim(),
      providerName: game.providerName.trim(),
      slug: game.slug.trim().toLowerCase(),
      description: null,
      thumbnailUrl: game.thumb.url.trim(),
      isActive: true,
    };
  });

  const chunks = chunkArray(games, 500);

  for (const chunk of chunks) {
    await gameRepository.upsert(chunk, {
      conflictPaths: ['externalId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  console.log(`✓ ${games.length} games seed done.`);
}
