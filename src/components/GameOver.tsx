import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameOverProps {
  score: number;
  onPlayAgain: () => void;
  isWin?: boolean;
}

const GameOver = ({ score, onPlayAgain }: GameOverProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />

      <h1 className="text-6xl md:text-5xl font-pixel text-orange-600 tracking-widest mb-12 z-10">
        GAME OVER
      </h1>

      <div className="z-10 bg-[#0f172a]/80 backdrop-blur-md border border-gray-700 rounded-3xl px-16 py-14 flex flex-col items-center shadow-[0_0_40px_rgba(255,215,0,0.4)]">
        <Trophy className="w-14 h-14 text-yellow-400 mb-4" />

        <p className="text-gray-400 text-sm tracking-wide mb-2">
          Your Score
        </p>

        <p className="text-6xl font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">
          {score}
        </p>
      </div>

      <div className="z-10 mt-12 flex flex-col gap-6 w-64">
        <button
          onClick={onPlayAgain}
          className="w-full py-3 text-sm font-pixel 
                     bg-[#388e8f] hover:bg-[#2f7a7b]
                     text-white 
                     rounded-xl
                     transition-all duration-200"
        >
          PLAY AGAIN
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 text-sm font-pixel 
                     bg-[#388e8f] hover:bg-[#2f7a7b]
                     text-white 
                     rounded-xl
                     transition-all duration-200"
        >
          EXIT GAME
        </button>
      </div>

    </div>
  );
};

export default GameOver;

