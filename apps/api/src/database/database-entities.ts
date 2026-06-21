import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';
import { CasinoEntity } from '../casinos/entities/casino.entity';
import { CountryEntity } from '../countries/entities/country.entity';
import { GameCountryEntity } from '../countries/entities/game-country.entity';
import { UserFavoriteGameEntity } from '../favorites/entities/user-favorite-game.entity';
import { GameTypeEntity } from '../game-types/entities/game-type.entity';
import { GameEntity } from '../games/entities/game.entity';
import { SpinHistoryEntity } from '../spins/entities/spin-history.entity';
import { UserEntity } from '../users/entities/user.entity';

export const databaseEntities = [
  UserEntity,
  CasinoEntity,
  GameTypeEntity,
  GameEntity,
  CountryEntity,
  GameCountryEntity,
  UserFavoriteGameEntity,
  RefreshTokenEntity,
  SpinHistoryEntity,
];
