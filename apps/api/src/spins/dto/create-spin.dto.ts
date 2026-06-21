import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateSpinDto {
  @ApiPropertyOptional({
    example: '1',
    description: 'Optional active game id',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: 'gameId must be a positive bigint id string',
  })
  gameId?: string;

  @ApiProperty({
    example: '1.50',
    description: 'Bet amount between 0.50 and 5.00 in 0.50 increments',
  })
  @IsString()
  @Matches(/^(0\.5|0\.50|[1-4](\.0|\.00|\.5|\.50)?|5(\.0|\.00)?)$/, {
    message: 'betAmount must be between 0.50 and 5.00 in 0.50 increments',
  })
  betAmount!: string;

  @ApiProperty({
    example: 'b4d2f2be-3a89-4d20-bac4-9353e1f57a71',
    description: 'Client-generated UUID for idempotency protection',
  })
  @IsUUID('4')
  idempotencyKey!: string;
}
