import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CasinoEntity } from '../../casinos/entities/casino.entity';
import { GameTypeEntity } from '../../game-types/entities/game-type.entity';
import { GameCountryEntity } from '../../countries/entities/game-country.entity';
import { UserFavoriteGameEntity } from '../../favorites/entities/user-favorite-game.entity';
import { SpinHistoryEntity } from '../../spins/entities/spin-history.entity';

@Entity('games')
@Index('uq_games_external_id', ['externalId'], { unique: true })
@Index('uq_games_casino_slug', ['casinoId', 'slug'], { unique: true })
@Index('idx_games_casino_id', ['casinoId'])
@Index('idx_games_game_type_id', ['gameTypeId'])
@Index('idx_games_is_active', ['isActive'])
export class GameEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id!: string;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalId!: string | null;

  @Column({
    name: 'casino_id',
    type: 'bigint',
  })
  casinoId!: string;

  @Column({
    name: 'game_type_id',
    type: 'bigint',
  })
  gameTypeId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  slug!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: 'thumbnail_url',
    type: 'text',
  })
  thumbnailUrl!: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @ManyToOne(() => CasinoEntity, (casino) => casino.games, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'casino_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_games_casino',
  })
  casino!: CasinoEntity;

  @ManyToOne(() => GameTypeEntity, (gameType) => gameType.games, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'game_type_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_games_game_type',
  })
  gameType!: GameTypeEntity;

  @Column({
    name: 'provider_name',
    type: 'varchar',
    length: 150,
  })
  providerName!: string;

  @OneToMany(() => GameCountryEntity, (gameCountry) => gameCountry.game)
  gameCountries!: GameCountryEntity[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @OneToMany(() => UserFavoriteGameEntity, (favoriteGame) => favoriteGame.game)
  favoritedByUsers!: UserFavoriteGameEntity[];

  @OneToMany(() => SpinHistoryEntity, (spin) => spin.game)
  spinHistory!: SpinHistoryEntity[];
}
