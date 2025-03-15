import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Import PuzzleCanvas with SSR disabled
const PuzzleCanvas = dynamic(() => import('../components/PuzzleCanvas'), {
  ssr: false // Disable server-side rendering for this component
});

export default function EmbedPuzzle() {
  const router = useRouter();
  
  // Add a loading state while waiting for client-side rendering
  if (!router.isReady) {
    return <div className="iframe-container loading">Loading puzzle...</div>;
  }

  return (
    <div className="iframe-container">
      <PuzzleCanvas {...router.query} />
      
      <style jsx>{`
        .iframe-container {
          width: 100%;
          height: 100vh;
          position: relative;
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: sans-serif;
        }
      `}</style>
    </div>
  );
}