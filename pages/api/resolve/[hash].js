// pages/api/resolve/[hash].js
import { getTokenIdByHash } from '../../../utils/db';

export default async function handler(req, res) {
  const { hash } = req.query;
  
  try {
    // Get tokenId from your database/contract
    const tokenId = await getTokenIdByHash(hash);
    
    if (!tokenId) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    // Redirect to actual puzzle page
    res.redirect(307, `/embed/${tokenId}`);
  } catch (error) {
    res.status(500).json({ error: 'Resolution failed' });
  }
}
