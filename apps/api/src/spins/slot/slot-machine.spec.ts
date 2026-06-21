/// <reference types="jest" />
import Decimal from 'decimal.js';

import { SlotSymbol } from '../entities/spin-history.entity';
import {
  calculatePayoutMultiplier,
  calculateSpinResult,
  normalizeCoinAmount,
} from './slot-machine';

describe('slot-machine', () => {
  describe('calculatePayoutMultiplier', () => {
    it('returns x50 for three cherries', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.CHERRY,
        SlotSymbol.CHERRY,
        SlotSymbol.CHERRY,
      ]);

      expect(multiplier.toString()).toBe('50');
    });

    it('returns x40 for two cherries from left to right', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.CHERRY,
        SlotSymbol.CHERRY,
        SlotSymbol.LEMON,
      ]);

      expect(multiplier.toString()).toBe('40');
    });

    it('returns x20 for three apples', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.APPLE,
        SlotSymbol.APPLE,
        SlotSymbol.APPLE,
      ]);

      expect(multiplier.toString()).toBe('20');
    });

    it('returns x10 for two apples from left to right', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.APPLE,
        SlotSymbol.APPLE,
        SlotSymbol.CHERRY,
      ]);

      expect(multiplier.toString()).toBe('10');
    });

    it('returns x0 for apple cherry apple because match is not consecutive from reel 1', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.APPLE,
        SlotSymbol.CHERRY,
        SlotSymbol.APPLE,
      ]);

      expect(multiplier.toString()).toBe('0');
    });

    it('returns x15 for three bananas', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.BANANA,
        SlotSymbol.BANANA,
        SlotSymbol.BANANA,
      ]);

      expect(multiplier.toString()).toBe('15');
    });

    it('returns x5 for two bananas from left to right', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.BANANA,
        SlotSymbol.BANANA,
        SlotSymbol.APPLE,
      ]);

      expect(multiplier.toString()).toBe('5');
    });

    it('returns x3 for three lemons', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.LEMON,
        SlotSymbol.LEMON,
        SlotSymbol.LEMON,
      ]);

      expect(multiplier.toString()).toBe('3');
    });

    it('returns x0 for two lemons because two lemons do not pay', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.LEMON,
        SlotSymbol.LEMON,
        SlotSymbol.APPLE,
      ]);

      expect(multiplier.toString()).toBe('0');
    });

    it('returns only the highest applicable payout', () => {
      const multiplier = calculatePayoutMultiplier([
        SlotSymbol.CHERRY,
        SlotSymbol.CHERRY,
        SlotSymbol.CHERRY,
      ]);

      expect(multiplier.toString()).toBe('50');
      expect(multiplier.toString()).not.toBe('40');
    });
  });

  describe('calculateSpinResult', () => {
    it('calculates gross winnings and net result for a winning spin', () => {
      const result = calculateSpinResult(new Decimal('1.50'), [
        SlotSymbol.CHERRY,
        SlotSymbol.CHERRY,
        SlotSymbol.LEMON,
      ]);

      expect(result.payoutMultiplier.toString()).toBe('40');
      expect(result.grossWinnings.toFixed(2)).toBe('60.00');
      expect(result.netResult.toFixed(2)).toBe('58.50');
    });

    it('calculates net loss when there is no payout', () => {
      const result = calculateSpinResult(new Decimal('2.00'), [
        SlotSymbol.APPLE,
        SlotSymbol.CHERRY,
        SlotSymbol.APPLE,
      ]);

      expect(result.payoutMultiplier.toString()).toBe('0');
      expect(result.grossWinnings.toFixed(2)).toBe('0.00');
      expect(result.netResult.toFixed(2)).toBe('-2.00');
    });

    it('calculates lemon triple payout', () => {
      const result = calculateSpinResult(new Decimal('5.00'), [
        SlotSymbol.LEMON,
        SlotSymbol.LEMON,
        SlotSymbol.LEMON,
      ]);

      expect(result.payoutMultiplier.toString()).toBe('3');
      expect(result.grossWinnings.toFixed(2)).toBe('15.00');
      expect(result.netResult.toFixed(2)).toBe('10.00');
    });
  });

  describe('normalizeCoinAmount', () => {
    it('formats values to two decimal places', () => {
      expect(normalizeCoinAmount(new Decimal('1'))).toBe('1.00');
      expect(normalizeCoinAmount(new Decimal('1.5'))).toBe('1.50');
      expect(normalizeCoinAmount(new Decimal('1.555'))).toBe('1.56');
    });
  });
});
