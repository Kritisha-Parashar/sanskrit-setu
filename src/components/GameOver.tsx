import { Trophy, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface GameOverProps {
  score: number;
  onPlayAgain: () => void;
  isWin?: boolean;
}
const GameOver = ({ score, onPlayAgain, isWin = false }: GameOverProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 relative z-10">
      <h1 className={`font-pixel text-5xl md:text-6xl tracking-wider ${isWin ? "text-accent glow-accent" : "text-game-over glow-red"}`}>
        {isWin ? "You Win!" : "Game Over"}
      </h1>

      <div className="border border-border rounded-xl p-8 flex flex-col items-center gap-4 glow-box-primary bg-card/60 backdrop-blur-sm min-w-[220px]">
        {isWin ? (
          <Star className="w-14 h-14 text-accent glow-accent fill-accent" />
        ) : (
          <Trophy className="w-14 h-14 text-accent glow-accent" />
        )}
        <p className="text-muted-foreground font-orbitron text-sm">Your Score</p>
        <p className="text-5xl font-bold text-accent glow-accent font-orbitron">{score}</p>
      </div>

      <button
        onClick={onPlayAgain}
        className="font-pixel text-lg px-10 py-4 rounded-xl bg-primary text-primary-foreground glow-box-primary hover:scale-105 transition-transform tracking-widest uppercase"
      >
        Play Again
      </button>
      <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => {
          try {
            navigate("/dashboard"); // change if your learner dashboard path is different
          } catch (err) {
            console.error("Return navigation failed:", err);
          }
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Learning
      </button>
</div>

    </div>
  );
};

export default GameOver;
