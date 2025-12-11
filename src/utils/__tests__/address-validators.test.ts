jest.mock('multicoin-address-validator', () => ({
  validate: jest.fn(),
}));

jest.mock('@ton/core', () => ({
  Address: {
    parse: jest.fn(),
  },
}));

jest.mock('@/config/networks', () => {
  const makeValidator = (label: string) => (address: string) => {
    if (address === `valid-${label}`) {
      return { valid: true as const };
    }
    return {
      valid: false as const,
      error: `Invalid ${label} address (mock)`,
    };
  };

  return {
    networkConfigs: {
      ethereum: { addressValidator: makeValidator('EVM') },
      polygon: { addressValidator: makeValidator('EVM') },
      arbitrum: { addressValidator: makeValidator('EVM') },

      bitcoin: { addressValidator: makeValidator('BTC') },

      ton: { addressValidator: makeValidator('TON') },
      tron: { addressValidator: makeValidator('TRON') },
      solana: { addressValidator: makeValidator('SOLANA') },

    },
  };
});

enum NetworkType {
  SEGWIT = 'bitcoin',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  TRON = 'tron',
  TON = 'ton',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
}

import WAValidator from 'multicoin-address-validator';
import { Address } from '@ton/core';

import {
  validateAddressByNetwork,
  validateEvmAddress,
  validateBitcoinAddress,
  validateTonAddress,
  validateTronAddress,
  validateSolanaAddress,
} from '../address-validators';

describe('validateAddressByNetwork', () => {
  it('returns error when address is empty or whitespace only', () => {
    const res1 = validateAddressByNetwork(NetworkType.ETHEREUM, '');
    const res2 = validateAddressByNetwork(NetworkType.ETHEREUM, '   ');

    expect(res1).toEqual({
      valid: false,
      error: 'Recipient address is required',
    });

    expect(res2).toEqual({
      valid: false,
      error: 'Recipient address is required',
    });
  });

  it('delegates to EVM validator for EVM networks and returns its result', () => {
    // ethereum
    const ethOk = validateAddressByNetwork(NetworkType.ETHEREUM, '  valid-EVM ');
    const ethFail = validateAddressByNetwork(NetworkType.ETHEREUM, 'wrong-evm');

    expect(ethOk).toEqual({ valid: true });
    expect(ethFail).toEqual({
      valid: false,
      error: 'Invalid EVM address (mock)',
    });

    // polygon
    const polyOk = validateAddressByNetwork(NetworkType.POLYGON, 'valid-EVM');
    expect(polyOk).toEqual({ valid: true });

    // arbitrum
    const arbFail = validateAddressByNetwork(NetworkType.ARBITRUM, 'arb-bad');
    expect(arbFail).toEqual({
      valid: false,
      error: 'Invalid EVM address (mock)',
    });
  });

  it('delegates to BTC validator for SEGWIT and returns its result', () => {
    const ok = validateAddressByNetwork(NetworkType.SEGWIT, 'valid-BTC');
    const fail = validateAddressByNetwork(NetworkType.SEGWIT, 'btc-bad');

    expect(ok).toEqual({ valid: true });
    expect(fail).toEqual({
      valid: false,
      error: 'Invalid BTC address (mock)',
    });
  });

  it('delegates to TON validator and returns its result', () => {
    const ok = validateAddressByNetwork(NetworkType.TON, 'valid-TON');
    const fail = validateAddressByNetwork(NetworkType.TON, 'ton-bad');

    expect(ok).toEqual({ valid: true });
    expect(fail).toEqual({
      valid: false,
      error: 'Invalid TON address (mock)',
    });
  });

  it('delegates to TRON validator and returns its result', () => {
    const ok = validateAddressByNetwork(NetworkType.TRON, 'valid-TRON');
    const fail = validateAddressByNetwork(NetworkType.TRON, 'tron-bad');

    expect(ok).toEqual({ valid: true });
    expect(fail).toEqual({
      valid: false,
      error: 'Invalid TRON address (mock)',
    });
  });

  it('delegates to SOLANA validator and returns its result', () => {
    const ok = validateAddressByNetwork(NetworkType.SOLANA, 'valid-SOLANA');
    const fail = validateAddressByNetwork(NetworkType.SOLANA, 'sol-bad');

    expect(ok).toEqual({ valid: true });
    expect(fail).toEqual({
      valid: false,
      error: 'Invalid SOLANA address (mock)',
    });
  });
});

describe('concrete validators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEvmAddress', () => {
    it('returns valid=true when multicoin says address is valid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(true);

      const result = validateEvmAddress('0xSomeEvmAddress');
      expect(WAValidator.validate).toHaveBeenCalledWith('0xSomeEvmAddress', 'eth');
      expect(result).toEqual({ valid: true });
    });

    it('returns error when multicoin says address is invalid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(false);

      const result = validateEvmAddress('0xBad');
      expect(result).toEqual({
        valid: false,
        error: 'Invalid EVM address. Please check the address and try again.',
      });
    });
  });

  describe('validateBitcoinAddress', () => {
    it('returns valid=true when multicoin says BTC is valid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(true);

      const result = validateBitcoinAddress('btc-address');
      expect(WAValidator.validate).toHaveBeenCalledWith('btc-address', 'btc');
      expect(result).toEqual({ valid: true });
    });

    it('returns error when multicoin says BTC is invalid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(false);

      const result = validateBitcoinAddress('bad-btc');
      expect(result).toEqual({
        valid: false,
        error: 'Invalid Bitcoin address. Please check the address format.',
      });
    });
  });

  describe('validateTonAddress', () => {
    it('returns valid=true when Address.parse does not throw', () => {
      (Address.parse as jest.Mock).mockImplementation(() => ({}));

      const result = validateTonAddress('ton-address');
      expect(Address.parse).toHaveBeenCalledWith('ton-address');
      expect(result).toEqual({ valid: true });
    });

    it('returns error when Address.parse throws', () => {
      (Address.parse as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      const result = validateTonAddress('bad-ton');
      expect(result).toEqual({
        valid: false,
        error: 'Invalid TON address. Please check the address and try again.',
      });
    });
  });

  describe('validateTronAddress', () => {
    it('returns valid=true when multicoin says TRON is valid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(true);

      const result = validateTronAddress('TValid...');
      expect(WAValidator.validate).toHaveBeenCalledWith('TValid...', 'trx');
      expect(result).toEqual({ valid: true });
    });

    it('returns error when multicoin says TRON is invalid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(false);

      const result = validateTronAddress('bad-tron');
      expect(result).toEqual({
        valid: false,
        error: 'Invalid Tron address. Please check the address and try again.',
      });
    });
  });

  describe('validateSolanaAddress', () => {
    it('returns valid=true when multicoin says SOL is valid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(true);

      const result = validateSolanaAddress('So111...');
      expect(WAValidator.validate).toHaveBeenCalledWith('So111...', 'sol');
      expect(result).toEqual({ valid: true });
    });

    it('returns error when multicoin says SOL is invalid', () => {
      (WAValidator.validate as jest.Mock).mockReturnValue(false);

      const result = validateSolanaAddress('bad-sol');
      expect(result).toEqual({
        valid: false,
        error: 'Invalid Solana address. Please check the address and try again.',
      });
    });
  });
});
