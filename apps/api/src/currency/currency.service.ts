import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';

import { UsersService } from '../users/users.service';

interface CachedRate {
  rate: Decimal;
  rateDate: string | null;
  expiresAt: number;
}

interface FrankfurterRateResponse {
  rate?: number;
  date?: string;
}

interface ConvertCurrencyInput {
  amount: string;
  from: string;
  to: string;
}

interface CurrencyConversionResponse {
  amount: string;
  from: string;
  to: string;
  rate: string;
  convertedAmount: string;
  rateDate: string | null;
  cached: boolean;
}

interface MyBalanceConversionResponse {
  balance: {
    amount: string;
    currency: string;
  };
  convertedBalance: {
    amount: string;
    currency: string;
  };
  rate: string;
  rateDate: string | null;
  cached: boolean;
}

@Injectable()
export class CurrencyService {
  private readonly rateCache = new Map<string, CachedRate>();

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async convert(
    input: ConvertCurrencyInput,
  ): Promise<CurrencyConversionResponse> {
    const amount = new Decimal(input.amount);

    if (amount.lessThan(0)) {
      throw new BadRequestException(
        'amount must be greater than or equal to zero',
      );
    }

    const rateResult = await this.getRate(input.from, input.to);

    const convertedAmount = amount.mul(rateResult.rate);

    return {
      amount: this.formatMoney(amount),
      from: input.from,
      to: input.to,
      rate: rateResult.rate.toString(),
      convertedAmount: this.formatMoney(convertedAmount),
      rateDate: rateResult.rateDate,
      cached: rateResult.cached,
    };
  }

  async convertMyBalance(
    userId: string,
    to: string,
  ): Promise<MyBalanceConversionResponse> {
    const user = await this.usersService.findById(userId);

    const from =
      this.configService.get<string>('PLATFORM_BASE_CURRENCY') || 'EUR';

    const conversion = await this.convert({
      amount: user.balance,
      from,
      to,
    });

    return {
      balance: {
        amount: conversion.amount,
        currency: from,
      },
      convertedBalance: {
        amount: conversion.convertedAmount,
        currency: to,
      },
      rate: conversion.rate,
      rateDate: conversion.rateDate,
      cached: conversion.cached,
    };
  }

  private async getRate(
    from: string,
    to: string,
  ): Promise<{
    rate: Decimal;
    rateDate: string | null;
    cached: boolean;
  }> {
    if (from === to) {
      return {
        rate: new Decimal(1),
        rateDate: null,
        cached: true,
      };
    }

    const cacheKey = `${from}:${to}`;
    const cachedRate = this.rateCache.get(cacheKey);

    if (cachedRate && cachedRate.expiresAt > Date.now()) {
      return {
        rate: cachedRate.rate,
        rateDate: cachedRate.rateDate,
        cached: true,
      };
    }

    const rateResponse = await this.fetchRate(from, to);

    const ttlSeconds = Number(
      this.configService.get<string>('CURRENCY_CACHE_TTL_SECONDS') || '3600',
    );

    this.rateCache.set(cacheKey, {
      rate: rateResponse.rate,
      rateDate: rateResponse.rateDate,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return {
      rate: rateResponse.rate,
      rateDate: rateResponse.rateDate,
      cached: false,
    };
  }

  private async fetchRate(
    from: string,
    to: string,
  ): Promise<{
    rate: Decimal;
    rateDate: string | null;
  }> {
    const baseUrl =
      this.configService.get<string>('CURRENCY_API_BASE_URL') ||
      'https://api.frankfurter.dev';

    const url = new URL(`/v2/rate/${from}/${to}`, baseUrl);

    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new ServiceUnavailableException('Currency provider is unavailable');
    }

    if (!response.ok) {
      throw new BadRequestException(
        `Currency conversion is not available for ${from}/${to}`,
      );
    }

    const data = (await response.json()) as FrankfurterRateResponse;

    if (typeof data.rate !== 'number') {
      throw new ServiceUnavailableException(
        'Currency provider returned an invalid response',
      );
    }

    return {
      rate: new Decimal(data.rate),
      rateDate: data.date ?? null,
    };
  }

  private formatMoney(value: Decimal): string {
    return value.toDecimalPlaces(2).toFixed(2);
  }
}
