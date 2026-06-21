import Decimal from 'decimal.js';

import { SlotSymbol } from '../entities/spin-history.entity';

export const REEL_1: SlotSymbol[] = [
  SlotSymbol.CHERRY,
  SlotSymbol.LEMON,
  SlotSymbol.APPLE,
  SlotSymbol.LEMON,
  SlotSymbol.BANANA,
  SlotSymbol.BANANA,
  SlotSymbol.LEMON,
  SlotSymbol.LEMON,
];

export const REEL_2: SlotSymbol[] = [
  SlotSymbol.LEMON,
  SlotSymbol.APPLE,
  SlotSymbol.LEMON,
  SlotSymbol.LEMON,
  SlotSymbol.CHERRY,
  SlotSymbol.APPLE,
  SlotSymbol.BANANA,
  SlotSymbol.LEMON,
];

export const REEL_3: SlotSymbol[] = [
  SlotSymbol.LEMON,
  SlotSymbol.APPLE,
  SlotSymbol.LEMON,
  SlotSymbol.APPLE,
  SlotSymbol.CHERRY,
  SlotSymbol.LEMON,
  SlotSymbol.BANANA,
  SlotSymbol.LEMON,
];

export interface SpinCalculationResult {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol];
  payoutMultiplier: Decimal;
  grossWinnings: Decimal;
  netResult: Decimal;
}

function getRandomSymbol(reel: SlotSymbol[]): SlotSymbol {
  const index = Math.floor(Math.random() * reel.length);

  return reel[index];
}

export function generateReels(): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [
    getRandomSymbol(REEL_1),
    getRandomSymbol(REEL_2),
    getRandomSymbol(REEL_3),
  ];
}

export function calculatePayoutMultiplier(
  reels: [SlotSymbol, SlotSymbol, SlotSymbol],
): Decimal {
  const [first, second, third] = reels;

  const firstTwoMatch = first === second;
  const allThreeMatch = first === second && second === third;

  if (!firstTwoMatch) {
    return new Decimal(0);
  }

  if (first === SlotSymbol.CHERRY) {
    return new Decimal(allThreeMatch ? 50 : 40);
  }

  if (first === SlotSymbol.APPLE) {
    return new Decimal(allThreeMatch ? 20 : 10);
  }

  if (first === SlotSymbol.BANANA) {
    return new Decimal(allThreeMatch ? 15 : 5);
  }

  if (first === SlotSymbol.LEMON) {
    return new Decimal(allThreeMatch ? 3 : 0);
  }

  return new Decimal(0);
}

export function calculateSpinResult(
  betAmount: Decimal,
  reels: [SlotSymbol, SlotSymbol, SlotSymbol] = generateReels(),
): SpinCalculationResult {
  const payoutMultiplier = calculatePayoutMultiplier(reels);
  const grossWinnings = betAmount.mul(payoutMultiplier);
  const netResult = grossWinnings.minus(betAmount);

  return {
    reels,
    payoutMultiplier,
    grossWinnings,
    netResult,
  };
}

export function normalizeCoinAmount(value: Decimal): string {
  return value.toDecimalPlaces(2).toFixed(2);
}
