import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Import components with SSR disabled
const PuzzleCanvas = dynamic(() => import('../../components/PuzzleCanvas'), {
  ssr: false
});

const Confetti = dynamic(() => import('../../components/Confetti'), {
  ssr: false
});

export default function EmbedPuzzle() {
  const router = useRouter();
  const { tokenId } = router.query;

  // Add a loading state while waiting for client-side rendering
  if (!router.isReady) {
    return <div className="embed-container loading">Loading puzzle...</div>;
  }

  return (
    <div className="embed-container">
      {tokenId && (
        <>
          <PuzzleCanvas 
            tokenId={tokenId}
            showControls={true}
            disableHeader={true}
            embeddedMode={true}
          />
          <Confetti active={false} />
        </>
      )}
      
      <style jsx global>{`
        body {
          margin: 0 !important;
          background: transparent !important;
          overflow: hidden !important;
        }
        .embed-container {
          width: 100vw;
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