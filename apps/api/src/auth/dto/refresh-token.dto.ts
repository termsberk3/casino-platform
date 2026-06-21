import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'a-valid-refresh-token-returned-from-login',
  })
  @IsString()
  @MinLength(32)
  @MaxLength(500)
  refreshToken!: string;
}
