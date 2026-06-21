import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { GameEntity } from '../../games/entities/game.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('user_favorite_games')
@Index('idx_user_favorite_games_game_user', ['gameId', 'userId'])
export class UserFavoriteGameEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId!: string;

  @PrimaryColumn({
    name: 'game_id',
    type: 'bigint',
  })
  gameId!: string;

  @ManyToOne(() => UserEntity, (user) => user.favoriteGames, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_favorite_games_user',
  })
  user!: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.favoritedByUsers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'game_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_favorite_games_game',
  })
  game!: GameEntity;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
