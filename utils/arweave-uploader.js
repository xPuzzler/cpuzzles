import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

export const uploadPuzzleHTML = async (htmlContent, walletKey) => {
  try {
    const transaction = await arweave.createTransaction({
      data: htmlContent
    }, walletKey);

    transaction.addTag('Content-Type', 'text/html');
    transaction.addTag('App-Name', 'PuzzleNFT');
    transaction.addTag('App-Version', '1.0.0');

    await arweave.transactions.sign(transaction, walletKey);
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200) return transaction.id;
    throw new Error('Arweave upload failed');
  } catch (error) {
    console.error('Arweave error:', error);
    throw new Error(`HTML upload failed: ${error.message}`);
  }
};