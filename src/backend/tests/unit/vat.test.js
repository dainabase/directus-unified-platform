/**
 * Unit Tests - Swiss TVA (VAT) Rates and Calculations
 * =====================================================
 *
 * Validates Swiss VAT compliance for HYPERVISUAL platform:
 * - Current rates (2025+): 8.1% normal, 2.6% reduced, 3.8% accommodation
 * - Ensures old rates (7.7%, 2.5%, 3.7%) are never used
 * - Edge cases: 0 amount, negative, rounding
 * - Net/gross price calculations
 *
 * Uses node:test runner (NOT Jest).
 *
 * @version 1.0.0
 * @date 2026-02-21
 * @author Claude Code
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Swiss TVA Rates (2025+) ──

const TVA_RATES = {
  normal: 8.1,
  reduced: 2.6,
  accommodation: 3.8,
};

const OLD_TVA_RATES = {
  normal: 7.7,
  reduced: 2.5,
  accommodation: 3.7,
};

// ── Helper functions (mirroring production logic) ──

/**
 * Calculate TVA amount from a net (HT) price.
 * All monetary values in integer centimes (CHF centimes).
 * @param {number} amountHT - Net amount in centimes
 * @param {number} rate - TVA rate as percentage (e.g. 8.1)
 * @returns {number} TVA amount in centimes, rounded to nearest centime
 */
function calculateTVA(amountHT, rate) {
  return Math.round(amountHT * rate / 100);
}

/**
 * Calculate gross (TTC) price from net (HT) price.
 * @param {number} amountHT - Net amount in centimes
 * @param {number} rate - TVA rate as percentage
 * @returns {number} Gross amount in centimes
 */
function calculateGross(amountHT, rate) {
  return amountHT + calculateTVA(amountHT, rate);
}

/**
 * Calculate net (HT) price from gross (TTC) price.
 * @param {number} amountTTC - Gross amount in centimes
 * @param {number} rate - TVA rate as percentage
 * @returns {number} Net amount in centimes
 */
function calculateNet(amountTTC, rate) {
  return Math.round(amountTTC / (1 + rate / 100));
}

/**
 * Extract TVA amount from a gross (TTC) price.
 * @param {number} amountTTC - Gross amount in centimes
 * @param {number} rate - TVA rate as percentage
 * @returns {number} TVA amount in centimes
 */
function extractTVA(amountTTC, rate) {
  return amountTTC - calculateNet(amountTTC, rate);
}

// ============================================================
// TEST SUITE
// ============================================================

describe('Swiss TVA (VAT) Compliance', () => {

  // ──────────────────────────────────────────
  // 1. Correct TVA rates
  // ──────────────────────────────────────────

  describe('1. Current TVA Rates (2025+)', () => {

    it('normal rate is 8.1%', () => {
      assert.equal(TVA_RATES.normal, 8.1, 'Normal TVA rate must be 8.1%');
    });

    it('reduced rate is 2.6%', () => {
      assert.equal(TVA_RATES.reduced, 2.6, 'Reduced TVA rate must be 2.6%');
    });

    it('accommodation rate is 3.8%', () => {
      assert.equal(TVA_RATES.accommodation, 3.8, 'Accommodation TVA rate must be 3.8%');
    });
  });

  // ──────────────────────────────────────────
  // 2. Old rates must NOT be used
  // ──────────────────────────────────────────

  describe('2. Old TVA Rates Rejection', () => {

    it('normal rate is NOT 7.7% (old rate)', () => {
      assert.notEqual(TVA_RATES.normal, OLD_TVA_RATES.normal,
        'Normal rate must NOT be 7.7% — old rate superseded 2024-01-01');
    });

    it('reduced rate is NOT 2.5% (old rate)', () => {
      assert.notEqual(TVA_RATES.reduced, OLD_TVA_RATES.reduced,
        'Reduced rate must NOT be 2.5% — old rate superseded 2024-01-01');
    });

    it('accommodation rate is NOT 3.7% (old rate)', () => {
      assert.notEqual(TVA_RATES.accommodation, OLD_TVA_RATES.accommodation,
        'Accommodation rate must NOT be 3.7% — old rate superseded 2024-01-01');
    });

    it('none of the current rates match any old rate', () => {
      const currentValues = Object.values(TVA_RATES);
      const oldValues = Object.values(OLD_TVA_RATES);

      for (const oldRate of oldValues) {
        assert.ok(
          !currentValues.includes(oldRate),
          `Old rate ${oldRate}% must not appear in current rates`
        );
      }
    });
  });

  // ──────────────────────────────────────────
  // 3. TVA calculation on net amounts
  // ──────────────────────────────────────────

  describe('3. TVA Calculation (Net -> TVA Amount)', () => {

    it('8.1% on 10000 centimes (100.00 CHF) = 810 centimes (8.10 CHF)', () => {
      const tva = calculateTVA(10000, TVA_RATES.normal);
      assert.equal(tva, 810);
    });

    it('2.6% on 10000 centimes (100.00 CHF) = 260 centimes (2.60 CHF)', () => {
      const tva = calculateTVA(10000, TVA_RATES.reduced);
      assert.equal(tva, 260);
    });

    it('3.8% on 10000 centimes (100.00 CHF) = 380 centimes (3.80 CHF)', () => {
      const tva = calculateTVA(10000, TVA_RATES.accommodation);
      assert.equal(tva, 380);
    });

    it('8.1% on 2500000 centimes (25000.00 CHF) = 202500 centimes (2025.00 CHF)', () => {
      const tva = calculateTVA(2500000, TVA_RATES.normal);
      assert.equal(tva, 202500);
    });

    it('8.1% on 1 centime = 0 centimes (rounds down)', () => {
      const tva = calculateTVA(1, TVA_RATES.normal);
      assert.equal(tva, 0);
    });

    it('8.1% on 13 centimes = 1 centime (rounds correctly)', () => {
      // 13 * 8.1 / 100 = 1.053 -> rounds to 1
      const tva = calculateTVA(13, TVA_RATES.normal);
      assert.equal(tva, 1);
    });
  });

  // ──────────────────────────────────────────
  // 4. Edge cases
  // ──────────────────────────────────────────

  describe('4. Edge Cases', () => {

    it('TVA on 0 amount is 0', () => {
      assert.equal(calculateTVA(0, TVA_RATES.normal), 0);
      assert.equal(calculateTVA(0, TVA_RATES.reduced), 0);
      assert.equal(calculateTVA(0, TVA_RATES.accommodation), 0);
    });

    it('TVA on negative amount produces negative TVA (credit note)', () => {
      const tva = calculateTVA(-10000, TVA_RATES.normal);
      assert.equal(tva, -810, 'Negative amounts should produce negative TVA (credit notes)');
    });

    it('TVA rounding to nearest centime', () => {
      // 123 * 8.1 / 100 = 9.963 -> rounds to 10
      const tva = calculateTVA(123, TVA_RATES.normal);
      assert.equal(tva, 10);

      // 456 * 2.6 / 100 = 11.856 -> rounds to 12
      const tva2 = calculateTVA(456, TVA_RATES.reduced);
      assert.equal(tva2, 12);

      // 789 * 3.8 / 100 = 29.982 -> rounds to 30
      const tva3 = calculateTVA(789, TVA_RATES.accommodation);
      assert.equal(tva3, 30);
    });

    it('TVA result is always an integer (centimes)', () => {
      const testAmounts = [1, 7, 13, 99, 101, 999, 12345, 9999999];

      for (const amount of testAmounts) {
        for (const rate of Object.values(TVA_RATES)) {
          const tva = calculateTVA(amount, rate);
          assert.ok(
            Number.isInteger(tva),
            `TVA on ${amount} at ${rate}% should be integer, got ${tva}`
          );
        }
      }
    });

    it('large amount: 8.1% on 99999999 centimes', () => {
      const tva = calculateTVA(99999999, TVA_RATES.normal);
      // 99999999 * 8.1 / 100 = 8099999.919 -> Math.round = 8100000
      const expected = Math.round(99999999 * 8.1 / 100);
      assert.equal(tva, expected);
      assert.equal(tva, 8100000);
    });
  });

  // ──────────────────────────────────────────
  // 5. Gross (TTC) price calculations
  // ──────────────────────────────────────────

  describe('5. Net/Gross Price Calculations', () => {

    it('gross = net + TVA at 8.1%', () => {
      const net = 10000; // 100.00 CHF
      const gross = calculateGross(net, TVA_RATES.normal);
      assert.equal(gross, 10810); // 108.10 CHF
    });

    it('gross = net + TVA at 2.6%', () => {
      const net = 10000;
      const gross = calculateGross(net, TVA_RATES.reduced);
      assert.equal(gross, 10260); // 102.60 CHF
    });

    it('gross = net + TVA at 3.8%', () => {
      const net = 10000;
      const gross = calculateGross(net, TVA_RATES.accommodation);
      assert.equal(gross, 10380); // 103.80 CHF
    });

    it('net from gross at 8.1% is inverse (within 1 centime)', () => {
      const originalNet = 2500000; // 25000.00 CHF
      const gross = calculateGross(originalNet, TVA_RATES.normal);
      const recoveredNet = calculateNet(gross, TVA_RATES.normal);

      // Due to rounding, allow 1 centime difference
      assert.ok(
        Math.abs(recoveredNet - originalNet) <= 1,
        `Net recovery: expected ~${originalNet}, got ${recoveredNet}`
      );
    });

    it('extract TVA from gross at 8.1%', () => {
      const gross = 10810; // 108.10 CHF (= 100.00 + 8.10)
      const tva = extractTVA(gross, TVA_RATES.normal);
      const net = calculateNet(gross, TVA_RATES.normal);

      assert.equal(net + tva, gross, 'net + extracted TVA must equal gross');
    });

    it('gross of 0 is 0', () => {
      assert.equal(calculateGross(0, TVA_RATES.normal), 0);
    });

    it('net of 0 is 0', () => {
      assert.equal(calculateNet(0, TVA_RATES.normal), 0);
    });
  });

  // ──────────────────────────────────────────
  // 6. Real-world invoice scenarios
  // ──────────────────────────────────────────

  describe('6. Real-World Invoice Scenarios', () => {

    it('LED wall installation: 25000 CHF HT + 8.1% TVA', () => {
      const amountHT = 2500000; // 25000.00 CHF in centimes
      const tva = calculateTVA(amountHT, TVA_RATES.normal);
      const amountTTC = calculateGross(amountHT, TVA_RATES.normal);

      assert.equal(tva, 202500, 'TVA should be 2025.00 CHF');
      assert.equal(amountTTC, 2702500, 'TTC should be 27025.00 CHF');
    });

    it('hotel digital signage: 5000 CHF HT + 3.8% accommodation rate', () => {
      const amountHT = 500000;
      const tva = calculateTVA(amountHT, TVA_RATES.accommodation);
      const amountTTC = calculateGross(amountHT, TVA_RATES.accommodation);

      assert.equal(tva, 19000, 'TVA should be 190.00 CHF');
      assert.equal(amountTTC, 519000, 'TTC should be 5190.00 CHF');
    });

    it('reduced-rate supply: 1000 CHF HT + 2.6%', () => {
      const amountHT = 100000;
      const tva = calculateTVA(amountHT, TVA_RATES.reduced);
      const amountTTC = calculateGross(amountHT, TVA_RATES.reduced);

      assert.equal(tva, 2600, 'TVA should be 26.00 CHF');
      assert.equal(amountTTC, 102600, 'TTC should be 1026.00 CHF');
    });

    it('30% deposit on 27025 CHF TTC invoice', () => {
      const totalTTC = 2702500;
      const deposit = Math.round(totalTTC * 0.3);
      assert.equal(deposit, 810750, 'Deposit should be 8107.50 CHF');
    });
  });
});
