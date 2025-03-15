// utils/arweave.js
import Arweave from 'arweave';

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

export const createWallet = async () => {
    const wallet = await arweave.wallets.generate();
    return wallet;
};