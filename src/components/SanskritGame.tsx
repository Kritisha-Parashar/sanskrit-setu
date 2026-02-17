import { useState, useEffect, useCallback, useRef } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { wordBank, SanskritWord } from "../data/wordBank";
import { useSound } from "../hooks/useSound";
import monkeyImg from "../assets/monkey-rocket.png";

import GameOver from "./GameOver";
import StarField from "./StarField";

const safeWordBank: SanskritWord[] = Array.isArray(wordBank) ? wordBank : [];

const SanskritGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"playing" | "over" | "won">("playing");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentWord, setCurrentWord] = useState<SanskritWord | null>(null);
  
  // High-frequency values kept in Refs to avoid re-renders
  const playerXRef = useRef(50);
  const fallingWordsRef = useRef<any[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0); // Only for spawning/cleaning words

  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const sound = useSound();
  const playCorrect = useCallback(() => sound?.playCorrect?.(), [sound]);
  const playWrong = useCallback(() => sound?.playWrong?.(), [sound]);

  /* ---------- SPAWN LOGIC ---------- */
  const startRound = useCallback(() => {
    if (!safeWordBank.length) return;

    const word = safeWordBank[Math.floor(Math.random() * safeWordBank.length)];
    setCurrentWord(word);

    const others = safeWordBank.filter((w) => w.meaning !== word.meaning);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 2);
    const allOptions = [word.meaning, ...shuffledOthers.map(o => o.meaning)].sort(() => Math.random() - 0.5);

    fallingWordsRef.current = allOptions.map((text, i) => ({
      id: Math.random(),
      text,
      x: 20 + i * 30,
      y: -15 - (Math.random() * 10),
      isCorrect: text === word.meaning,
      speed: 0.6 + Math.random() * 0.2,
      el: null // Ref to the actual DOM element
    }));
    
    setRenderTrigger(prev => prev + 1); // Force one render to create the new DOM elements
  }, []);

  useEffect(() => {
    if (gameState === "playing") startRound();
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, startRound]);

  /* ---------- INPUT ---------- */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => (e.key.includes("Arrow") && keysRef.current.add(e.key));
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  /* ---------- ULTRA-SMOOTH GAME LOOP ---------- */
  useEffect(() => {
    if (gameState !== "playing") return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16, 3);
      lastTime = time;

      // 1. Move Player
      if (keysRef.current.has("ArrowLeft")) playerXRef.current = Math.max(10, playerXRef.current - 2.5 * dt);
      if (keysRef.current.has("ArrowRight")) playerXRef.current = Math.min(90, playerXRef.current + 2.5 * dt);

      // Update Player DOM directly for 60fps smoothness
      const playerEl = document.getElementById("player-monkey");
      if (playerEl) playerEl.style.left = `${playerXRef.current}%`;

      // 2. Move Words & Check Collision
      let needsReset = false;
      let missedCorrect = false;

      for (const w of fallingWordsRef.current) {
        w.y += w.speed * dt;
        
        // Update Word DOM directly
        const el = document.getElementById(`word-${w.id}`);
        if (el) el.style.top = `${w.y}%`;

        // Collision Logic
        const hitY = w.y >= 75 && w.y <= 88;
        const hitX = Math.abs(w.x - playerXRef.current) < 10;

        if (hitY && hitX) {
          if (w.isCorrect) {
            playCorrect();
            setScore(s => {
                if (s + 1 >= 20) setGameState("won");
                return s + 1;
            });
          } else {
            playWrong();
            setLives(l => {
                if (l <= 1) setGameState("over");
                return l - 1;
            });
          }
          needsReset = true;
          break;
        }

        if (w.y > 105) {
          if (w.isCorrect) missedCorrect = true;
        }
      }

      if (missedCorrect && !needsReset) {
        playWrong();
        setLives(l => {
          if (l <= 1) setGameState("over");
          return l - 1;
        });
        needsReset = true;
      }

      if (needsReset) {
        fallingWordsRef.current = [];
        startRound();
      } else {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, startRound, playCorrect, playWrong]);

  if (gameState !== "playing") {
    return (
      <div className="relative min-h-screen bg-slate-950">
        <StarField />
        <GameOver score={score} onPlayAgain={() => {
          setScore(0); setLives(3); playerXRef.current = 50; 
          setGameState("playing");
        }} isWin={gameState === "won"} />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-slate-950 overflow-hidden select-none">
      <StarField />

      {/* HUD */}
      <div className="relative z-30 flex justify-between p-6">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-8 h-8 ${i < lives ? "text-red-500 fill-red-500" : "text-slate-800"}`} />
          ))}
        </div>
        <div className="text-white text-2xl font-black">SCORE: {score}</div>
      </div>

      {/* PROMPT */}
      {currentWord && (
        <div className="absolute top-24 w-full text-center z-20">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">{currentWord.sanskrit}</h1>
        </div>
      )}

      {/* FALLING WORDS - Managed by Ref for performance */}
      {fallingWordsRef.current.map((w) => (
        <div
          key={w.id}
          id={`word-${w.id}`}
          className="absolute z-20 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-xl border-2 border-blue-400 pointer-events-none"
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: "translateX(-50%)",
            willChange: "top" // Optimizes for GPU
          }}
        >
          {w.text}
        </div>
      ))}

      {/* PLAYER */}
      <div
        id="player-monkey"
        className="absolute bottom-10 z-10 w-32 h-32 transition-none"
        style={{
          left: `${playerXRef.current}%`,
          transform: "translateX(-50%)",
          willChange: "left"
        }}
      >
        <img src={monkeyImg} alt="Monkey" className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

export default SanskritGame;