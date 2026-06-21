import { DataSource } from 'typeorm';

import { CasinoEntity } from '../../casinos/entities/casino.entity';

const casinos: Array<Pick<CasinoEntity, 'name' | 'slug' | 'isActive'>> = [
  {
    name: 'Demo Casino',
    slug: 'demo-casino',
    isActive: true,
  },
];

export async function seedCasinos(dataSource: DataSource): Promise<void> {
  const casinoRepository = dataSource.getRepository(CasinoEntity);

  await casinoRepository.upsert(casinos, {
    conflictPaths: ['slug'],
    skipUpdateIfNoValuesChanged: true,
  });

  console.log(`${casinos.length} casino seed done.`);
}
