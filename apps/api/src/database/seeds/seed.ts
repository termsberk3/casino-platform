import { AppDataSource } from '../data-source';

import { seedCasinos } from './casino.seed';
import { seedCountries } from './country.seed';
import { seedGameTypes } from './game-type.seed';
import { seedGames } from './game.seed';

async function runSeed(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Seed process started.');

    await seedCasinos(AppDataSource);
    await seedGameTypes(AppDataSource);
    await seedCountries(AppDataSource);
    await seedGames(AppDataSource);

    console.log('Seed process completed successfully.');
  } catch (error: unknown) {
    console.error('Seed process failed:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeed();
