import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { GameEntity } from '../../games/entities/game.entity';

@Entity('game_types')
@Index('uq_game_types_name', ['name'], { unique: true })
@Index('uq_game_types_slug', ['slug'], { unique: true })
export class GameTypeEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  slug!: string;

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

  @OneToMany(() => GameEntity, (game) => game.gameType)
  games!: GameEntity[];
}
