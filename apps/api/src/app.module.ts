import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseEntities } from './database/database-entities';
import { GamesModule } from './games/games.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FavoritesModule } from './favorites/favorites.module';
import { SpinsModule } from './spins/spins.module';
import { CurrencyModule } from './currency/currency.module';

import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.getOrThrow<string>('DATABASE_URL'),
        entities: databaseEntities,
        synchronize: false,
        migrationsRun: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    GamesModule,
    UsersModule,
    AuthModule,
    FavoritesModule,
    SpinsModule,
    CurrencyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
