import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import astronautFlying from "@/assets/mascot/astronaut-flying.json";
import mascotHappy from "@/assets/mascot-happy.png";
import mascotSad from "@/assets/mascot-sad.png";
import mascotCelebrate from "@/assets/mascot-celebrate.png";



type MascotMood = "happy" | "sad" | "celebrate" | "thinking";

interface SpeechBubble {
  message: string;
  duration?: number;
}

interface InteractiveMascotProps {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  speechBubble?: SpeechBubble;
  className?: string;
  onClick?: () => void;
  messages?: string[];
  showHeart?: boolean;
}

const mascotAnimations: Record<MascotMood, any> = {
  happy: astronautFlying,
  sad: null,
  celebrate: null,
  thinking: null,
};
const mascotImages: Record<MascotMood, any> = {
  happy: astronautFlying,
  sad: mascotSad,
  celebrate:
    mascotCelebrate,
  thinking: mascotHappy,
};

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

const defaultMessages = [
  "Keep learning! 📚",
  "You're doing great! ⭐",
  "नमस्ते! 🙏",
  "Let's practice! 🎯",
  "Amazing progress! 🎉",
];

const InteractiveMascot = ({
  mood = "happy",
  size = "md",
  speechBubble,
  className,
  onClick,
  messages = defaultMessages,
  showHeart = false,
}: InteractiveMascotProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (speechBubble?.message) {
      setCurrentMessage(speechBubble.message);
      const timer = setTimeout(() => {
        setCurrentMessage(null);
      }, speechBubble.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [speechBubble]);

  const handleClick = () => {
    setIsClicked(true);
    setCurrentMessage(messages[messageIndex]);
    setMessageIndex((prev) => (prev + 1) % messages.length);

    setTimeout(() => setIsClicked(false), 300);
    setTimeout(() => setCurrentMessage(null), 2500);

    onClick?.();
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      {/* Heart icon that shows on hover */}
      {(showHeart || isHovered) && (
        <div className="absolute -top-2 -right-2 z-10 animate-bounce-gentle">
          <svg
            className="w-6 h-6 text-rose-500 drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* Speech Bubble */}
      {currentMessage && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="bg-card px-4 py-2 rounded-2xl shadow-elevated border border-border whitespace-nowrap">
            <p className="text-sm font-semibold text-foreground">{currentMessage}</p>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card" />
        </div>
      )}

      {/* Mascot Image */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative transition-all duration-300 cursor-pointer focus:outline-none",
          sizeClasses[size],
          isHovered && "scale-110",
          isClicked && "scale-95 rotate-3"
        )}
      >
        {mood === "happy" ? (
          <Lottie
            animationData={mascotAnimations[mood]}
            loop
            autoplay
            className={cn(
              "w-full h-full drop-shadow-lg transition-transform duration-300",
              isHovered && "drop-shadow-2xl"
            )}
          />
        ) : (
          <img
            src={mascotImages[mood]}
            alt="Mascot"
            className={cn(
              "w-full h-full object-contain drop-shadow-lg transition-transform duration-300",
              mood === "celebrate" && "animate-float",
              isHovered && "drop-shadow-2xl"
            )}
          />
        )}

        {/* Glow effect on hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-accent/20 blur-xl transition-opacity duration-300 -z-10",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </button>
    </div>
  );
};

export default InteractiveMascot;
