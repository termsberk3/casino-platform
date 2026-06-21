import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
@Index('uq_refresh_tokens_token_hash', ['tokenHash'], { unique: true })
@Index('idx_refresh_tokens_user_id', ['userId'])
@Index('idx_refresh_tokens_expires_at', ['expiresAt'])
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id!: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId!: string;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
  })
  tokenHash!: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_refresh_tokens_user',
  })
  user!: UserEntity;

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
}
