import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { GameEntity } from '../../games/entities/game.entity';
import { CountryEntity } from './country.entity';

@Entity('game_countries')
@Index('idx_game_countries_country_game', ['countryId', 'gameId'])
export class GameCountryEntity {
  @PrimaryColumn({
    name: 'game_id',
    type: 'bigint',
  })
  gameId!: string;

  @PrimaryColumn({
    name: 'country_id',
    type: 'bigint',
  })
  countryId!: string;

  @ManyToOne(() => GameEntity, (game) => game.gameCountries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'game_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_game_countries_game',
  })
  game!: GameEntity;

  @ManyToOne(() => CountryEntity, (country) => country.gameCountries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'country_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_game_countries_country',
  })
  country!: CountryEntity;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
