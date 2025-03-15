// pages/embed.js
export default function EmbedPuzzle() {
    return (
      <div className="iframe-container">
        <PuzzleCanvas {...router.query} />
      </div>
    )
  }