import { useRouter } from 'next/router';
import PuzzleCanvas from '../../components/PuzzleCanvas';
import Confetti from '../../components/Confetti';

export default function EmbedPuzzle() {
  const router = useRouter();
  const { tokenId } = router.query;

  return (
    <div className="embed-container">
      <PuzzleCanvas 
        tokenId={tokenId}
        showControls={true}
        disableHeader={true}
        embeddedMode={true}
      />
      <Confetti active={false} /> {/* Needed for dependency */}
      
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
      `}</style>
    </div>
  );
}