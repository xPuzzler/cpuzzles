import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import Link from 'next/link';

import WalletConnect from '../components/WalletConnect';
import PuzzleGenerator from '../components/PuzzleGenerator';
import { Puzzle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('create');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  if (!mounted) return null;
  return (
    <div className="container">
      <Head>
        <title>CryptoPuzzle</title>
        <meta name="description" content="Create and play with interactive puzzle NFTs" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" stroke-width="2">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6366f1" />
                  <stop offset="100%" style="stop-color:#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M19 11V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H7v2H5c-1.1 0-2 .9-2 2v2H1v2h2v2H1v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2z" stroke="url(#gradient)" fill="none"/>
            </svg>
          `)}`}
        />
      </Head>

      <header>
        <div className="flex items-center space-x-2">
          <div className="logo-gradient w-10 h-10 rounded-lg flex items-center justify-center transform group-hover:rotate-45 group-hover:scale-110 overflow-hidden">
            <Puzzle className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            CryptoPuzzle
          </h1>
        </div>
        <div className="wallet-connect">
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg blur-sm opacity-75"></div>
      <WalletConnect className="relative bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200" />
    </div>
    </div>
      </header>

      <main className="w-full">
        <div className="hero text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">
            Create, Mint, and Solve Puzzle NFTs
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Upload your images, create interactive puzzles, mint them as NFTs, 
            and challenge others to solve them.
          </p>
        </div>
        
        <div className="tab-content w-full max-w-7xl mx-auto">
          <div className="create-puzzle">
            {isConnected ? (
              <div className="puzzle-container relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-cyan-400/10 rounded-xl blur-xl opacity-75 transition-opacity group-hover:opacity-100"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 group-hover:border-white/20">
                  <PuzzleGenerator />
                </div>
              </div>
            ) : (
              <div className="connect-prompt text-center p-8 bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl">
                <p className="text-gray-400 text-lg">
                  Please connect your wallet to create puzzle NFTs
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12">
        <p className="text-gray-400 text-center">
          Puzzle NFT Platform &copy; {new Date().getFullYear()}
        </p>
      </footer>
      
      <style jsx global>{`
        body {
          background:rgb(0, 0, 0);
          color: white;
        }
        
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 0;
          border-bottom: 1px solid #2d2d2d;
        }
        
        main {
          flex: 1;
          padding: 2rem 1rem;
        }

        .puzzle-container {
    width: 100%;
    border-radius: 1rem;
    transition: all 0.3s ease;
  }

  .puzzle-container:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  }

  .puzzle-container .relative {
    isolation: isolate;
  }

        .wallet-connect {
    position: relative;
    z-index: 10;
  }
  
  .wallet-connect button {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .wallet-connect button:hover {
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }

        .logo-gradient {
    background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
  }
        
        .tab {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}