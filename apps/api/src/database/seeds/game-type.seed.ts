import { DataSource } from 'typeorm';

import { GameTypeEntity } from '../../game-types/entities/game-type.entity';

const gameTypes: Array<Pick<GameTypeEntity, 'name' | 'slug'>> = [
  {
    name: 'Slot',
    slug: 'slot',
  },
  {
    name: 'Live Casino',
    slug: 'live-casino',
  },
  {
    name: 'Table Game',
    slug: 'table-game',
  },
  {
    name: 'Scratch Card',
    slug: 'scratch-card',
  },
];

export async function seedGameTypes(dataSource: DataSource): Promise<void> {
  const gameTypeRepository = dataSource.getRepository(GameTypeEntity);

  await gameTypeRepository.upsert(gameTypes, {
    conflictPaths: ['slug'],
    skipUpdateIfNoValuesChanged: true,
  });

  console.log(`✓ ${gameTypes.length} game type seed done.`);
}
