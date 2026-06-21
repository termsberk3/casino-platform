import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class MyBalanceCurrencyQueryDto {
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'to must be a 3-letter currency code',
  })
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  to!: string;
}
