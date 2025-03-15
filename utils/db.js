const hashMap = new Map();

export const storeHashMapping = (hash, tokenId) => {
  hashMap.set(hash, tokenId);
};

export const getTokenIdByHash = (hash) => {
  return hashMap.get(hash) || null;
};