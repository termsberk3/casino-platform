import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class ConvertCurrencyQueryDto {
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount must be a positive money amount',
  })
  amount!: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'from must be a 3-letter currency code',
  })
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  from!: string;

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
