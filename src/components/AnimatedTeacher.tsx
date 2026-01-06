import { useEffect, useState, useRef } from "react";
import teacherImg from "@/assets/teacher.png"; 

// --- SANSKRIT PHONETIC TYPES ---
type Viseme = 
  | "rest"      // Silent
  | "kanthya"   // A, Ha (Open Throat)
  | "talavya"   // I, Ya, Sha (Wide, teeth gap)
  | "osthya"    // U, Va (Round lips)
  | "osthya_o"  // O, Au (Wide Round)
  | "dantya"    // Ta, Sa, La (Tongue touches teeth)
  | "murdhanya" // Ra, Sha (Tongue curled up)
  | "closed";   // Ma, Pa (Lips touching)

interface AnimatedTeacherProps {
  isSpeaking: boolean;
  text: string;
}

// --- GEOMETRY DATA (The "Bone Structure") ---
const MOUTH_SHAPES: Record<Viseme, { lips: string; tongue: string; teethOpen: number; jawOpen: number }> = {
  // Neutral
  rest: { 
    lips: "M 15,50 Q 50,60 85,50 Q 50,55 15,50", 
    tongue: "M 30,60 Q 50,60 70,60", 
    teethOpen: 0, 
    jawOpen: 0 
  },
  
  // A / Ha (Big Vertical Opening)
  kanthya: { 
    lips: "M 20,45 Q 50,20 80,45 Q 80,85 50,85 Q 20,85 20,45", 
    tongue: "M 35,80 Q 50,85 65,80", 
    teethOpen: 40, 
    jawOpen: 25 
  },
  
  // I / Ya (Wide Horizontal Stretch)
  talavya: { 
    lips: "M 10,50 Q 50,65 90,50 Q 50,35 10,50", 
    tongue: "M 30,65 Q 50,60 70,65", 
    teethOpen: 15, 
    jawOpen: 5 
  },
  
  // U / Va (Tight Pucker)
  osthya: { 
    lips: "M 35,50 Q 50,70 65,50 Q 50,30 35,50", 
    tongue: "M 40,65 Q 50,65 60,65", 
    teethOpen: 0, 
    jawOpen: 10 
  },
  
  // O / Au (Large Round Pucker)
  osthya_o: { 
    lips: "M 25,50 Q 50,85 75,50 Q 50,15 25,50", 
    tongue: "M 40,75 Q 50,80 60,75", 
    teethOpen: 10, 
    jawOpen: 15 
  },
  
  // Ta / Sa (Teeth Visible, Tongue Touch)
  dantya: { 
    lips: "M 15,50 Q 50,75 85,50 Q 50,40 15,50", 
    tongue: "M 30,55 Q 50,45 70,55", // Tongue tip up
    teethOpen: 25, 
    jawOpen: 10 
  },

  // Ra / Rr (Retroflex - Tongue Curled)
  murdhanya: {
    lips: "M 20,50 Q 50,70 80,50 Q 50,40 20,50",
    tongue: "M 40,50 Q 50,35 60,50", // High curl
    teethOpen: 20,
    jawOpen: 8
  },
  
  // Ma / Pa (Closed Line)
  closed: { 
    lips: "M 15,55 Q 50,55 85,55 Q 50,55 15,55", 
    tongue: "M 30,60 Q 50,60 70,60", 
    teethOpen: 0, 
    jawOpen: 0 
  },
};

export default function AnimatedTeacher({ isSpeaking, text }: AnimatedTeacherProps) {
  const [currentViseme, setCurrentViseme] = useState<Viseme>("rest");
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const headBobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSpeaking) {
      setCurrentViseme("rest");
      if (animationRef.current) clearInterval(animationRef.current);
      if (headBobRef.current) headBobRef.current.style.transform = "translateY(0px)";
      return;
    }

    // 1. Text Analysis
    const queue: Viseme[] = [];
    const cleanText = text.toLowerCase();

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const next = cleanText[i + 1] || "";
      
      // Diphthongs & Special Cases
      if (char === "a" && (next === "u" || next === "o")) {
        queue.push("kanthya", "osthya_o"); 
        i++; continue;
      }
      if (char === "a" && (next === "i" || next === "y")) {
        queue.push("kanthya", "talavya"); 
        i++; continue;
      }

      // Phonetic Mapping
      if (["a", "h", "k", "g", "ṅ"].includes(char)) queue.push("kanthya");
      else if (["i", "e", "y", "c", "j", "ñ", "ś"].includes(char)) queue.push("talavya");
      else if (["u", "v", "w", "p", "b", "m"].includes(char)) queue.push(char === "u" ? "osthya" : "closed");
      else if (["o"].includes(char)) queue.push("osthya_o");
      else if (["t", "d", "n", "l", "s"].includes(char)) queue.push("dantya");
      else if (["r", "ṣ", "ṭ", "ḍ", "ṇ"].includes(char)) queue.push("murdhanya");
      else queue.push("kanthya"); 
    }

    // 2. Animation Loop
    let index = 0;
    animationRef.current = setInterval(() => {
      const shape = queue[index % queue.length];
      setCurrentViseme(shape);

      if (headBobRef.current) {
        const bob = Math.sin(Date.now() / 150) * 1.5; 
        headBobRef.current.style.transform = `translateY(${bob}px)`;
      }

      index++;
    }, 110); 

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isSpeaking, text]);

  const shapeData = MOUTH_SHAPES[currentViseme];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      
      <div 
        ref={headBobRef} 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
      >
        <img 
          src={teacherImg} 
          alt="Teacher" 
          className="h-full w-auto object-contain pointer-events-none relative z-0"
        />

        {/* --- THE MOUTH RIG --- */}
        <div 
          className="absolute z-10"
          style={{
            // INCREASED SIZE AND ADJUSTED POSITION
            // Tweak 'bottom' if it's too high/low for your specific image
            bottom: "54.5%", 
            left: "52%",   
            width: "20%",  // Made Wider (was 14%)
            height: "12%", // Made Taller (was 8%)
            transform: "translateX(-50%)"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            
            {/* A. Throat (Darkness) */}
            <path
              d={shapeData.lips}
              fill="#3e1e1e" 
              className="transition-all duration-75"
            />

            {/* B. Tongue */}
            <path
              d={shapeData.tongue}
              fill="#d66b6b"
              className="transition-all duration-75"
            />

            {/* C. Upper Teeth */}
            <path
              d="M 20,50 Q 50,55 80,50 L 75,65 Q 50,70 25,65 Z"
              fill="#fffff0"
              className="transition-all duration-75"
              style={{ 
                opacity: shapeData.teethOpen > 5 ? 1 : 0,
                transform: `translateY(-${shapeData.teethOpen * 0.15}px)` 
              }}
            />

            {/* D. Lips (Skin Color Mask + Outline) */}
            {/* This strokeWidth is increased to 12 to ensure it covers the underlying static mouth */}
            <path
              d={shapeData.lips}
              fill="none" 
              stroke="#bf5b5b" // Lip Color matching illustration
              strokeWidth="12" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-75 ease-linear"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}