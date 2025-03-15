// utils/contract.js
import { base, baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES } from './constants';

export const getContractAddress = (chainId) => {
  const address = CONTRACT_ADDRESSES[chainId];
  if (!address) {
    console.error(`No contract address for chain ${chainId}`);
    return null;
  }
  return address;
};