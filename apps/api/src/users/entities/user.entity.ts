import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserFavoriteGameEntity } from '../../favorites/entities/user-favorite-game.entity';
import { RefreshTokenEntity } from '../../auth/entities/refresh-token.entity';
import { SpinHistoryEntity } from '../../spins/entities/spin-history.entity';

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

@Entity('users')
@Check('"balance" >= 0')
@Index('uq_users_email_lower', { synchronize: false })
export class UserEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  displayName!: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 20,
  })
  balance!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

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

  @OneToMany(() => UserFavoriteGameEntity, (favoriteGame) => favoriteGame.user)
  favoriteGames!: UserFavoriteGameEntity[];

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshTokenEntity[];

  @OneToMany(() => SpinHistoryEntity, (spin) => spin.user)
  spinHistory!: SpinHistoryEntity[];
}
