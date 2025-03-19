import React from 'react';

const SpamFilterToggle = ({ showSpamNFTs, setShowSpamNFTs }) => {
  return (
    <div className="flex items-center">
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={!showSpamNFTs} 
          onChange={() => setShowSpamNFTs(!showSpamNFTs)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                        peer-checked:after:border-white after:content-[''] after:absolute 
                        after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 
                        after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                        peer-checked:bg-blue-500"></div>
        <span className="ms-3 text-sm font-medium text-gray-300">
          Hide Likely Airdrops
        </span>
      </label>
    </div>
  );
};

export default SpamFilterToggle;