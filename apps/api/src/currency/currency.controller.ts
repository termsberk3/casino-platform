import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConvertCurrencyQueryDto } from './dto/convert-currency-query.dto';
import { MyBalanceCurrencyQueryDto } from './dto/my-balance-currency-query.dto';
import { CurrencyService } from './currency.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('convert')
  @ApiOperation({
    summary: 'Convert money amount between currencies',
  })
  @ApiQuery({
    name: 'amount',
    example: '20.00',
  })
  @ApiQuery({
    name: 'from',
    example: 'EUR',
  })
  @ApiQuery({
    name: 'to',
    example: 'USD',
  })
  convert(@Query() query: ConvertCurrencyQueryDto): unknown {
    return this.currencyService.convert({
      amount: query.amount,
      from: query.from,
      to: query.to,
    });
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Convert current user balance to selected currency',
  })
  @ApiQuery({
    name: 'to',
    example: 'TRY',
  })
  @UseGuards(JwtAuthGuard)
  convertMyBalance(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MyBalanceCurrencyQueryDto,
  ): unknown {
    return this.currencyService.convertMyBalance(user.id, query.to);
  }
}
