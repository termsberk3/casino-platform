import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GameEntity } from '../../games/entities/game.entity';
import { UserEntity } from '../../users/entities/user.entity';

export enum SlotSymbol {
  CHERRY = 'cherry',
  LEMON = 'lemon',
  APPLE = 'apple',
  BANANA = 'banana',
}

@Entity('spin_history')
@Check(
  'chk_spin_history_bet_amount',
  '"bet_amount" >= 0.50 AND "bet_amount" <= 5.00 AND MOD("bet_amount", 0.50) = 0',
)
@Check('chk_spin_history_gross_winnings', '"gross_winnings" >= 0')
@Check('chk_spin_history_payout_multiplier', '"payout_multiplier" >= 0')
@Check('chk_spin_history_balance_before', '"balance_before" >= 0')
@Check('chk_spin_history_balance_after', '"balance_after" >= 0')
@Check(
  'chk_spin_history_net_result',
  '"net_result" = "gross_winnings" - "bet_amount"',
)
@Check(
  'chk_spin_history_balance_calculation',
  '"balance_after" = "balance_before" - "bet_amount" + "gross_winnings"',
)
@Index('uq_spin_history_user_idempotency', ['userId', 'idempotencyKey'], {
  unique: true,
})
@Index('idx_spin_history_user_created_at', ['userId', 'createdAt'])
@Index('idx_spin_history_game_created_at', ['gameId', 'createdAt'])
export class SpinHistoryEntity {
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
    name: 'game_id',
    type: 'bigint',
    nullable: true,
  })
  gameId!: string | null;

  @Column({
    name: 'reel_1',
    type: 'enum',
    enum: SlotSymbol,
    enumName: 'slot_symbol_enum',
  })
  reel1!: SlotSymbol;

  @Column({
    name: 'reel_2',
    type: 'enum',
    enum: SlotSymbol,
    enumName: 'slot_symbol_enum',
  })
  reel2!: SlotSymbol;

  @Column({
    name: 'reel_3',
    type: 'enum',
    enum: SlotSymbol,
    enumName: 'slot_symbol_enum',
  })
  reel3!: SlotSymbol;

  @Column({
    name: 'bet_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  betAmount!: string;

  @Column({
    name: 'gross_winnings',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  grossWinnings!: string;

  @Column({
    name: 'net_result',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  netResult!: string;

  @Column({
    name: 'payout_multiplier',
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 0,
  })
  payoutMultiplier!: string;

  @Column({
    name: 'balance_before',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  balanceBefore!: string;

  @Column({
    name: 'balance_after',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  balanceAfter!: string;

  @Column({
    name: 'idempotency_key',
    type: 'uuid',
  })
  idempotencyKey!: string;

  @ManyToOne(() => UserEntity, (user) => user.spinHistory, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_spin_history_user',
  })
  user!: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.spinHistory, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'game_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_spin_history_game',
  })
  game!: GameEntity | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
