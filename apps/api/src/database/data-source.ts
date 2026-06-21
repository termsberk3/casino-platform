import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';

import { databaseEntities } from './database-entities';

config({
  path: resolve(__dirname, '../../.env'),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,

  entities: databaseEntities,

  migrations: [`${__dirname}/migrations/*{.ts,.js}`],

  synchronize: false,
  migrationsRun: false,
  logging: true,
});
