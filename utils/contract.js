// utils/contract.js
import { base, baseSepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESSES } from './constants';

export const getContractAddress = (chainId) => {
  const address = CONTRACT_ADDRESSES[chainId];
  if (!address) {
    console.error(`No contract address for chain ${chainId}`);
    return null;
  }
  return address;
};