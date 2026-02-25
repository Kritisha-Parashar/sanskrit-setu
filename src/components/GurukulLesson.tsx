import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import teacherScriptImg from "@/assets/teacherScript.png";
import monkeySitImg from "@/assets/monkey-sit.png";
import monkeyCorrectImg from "@/assets/monkey-correct.png";
import monkeyCryingImg from "@/assets/monkey-crying.png";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // <-- Added icon
import { Button } from "@/components/ui/button"; // <-- Added UI Button

// ─── Types ───────────────────────────────────────────────────────────
interface DialogueStep {
  speaker: "teacher" | "monkey";
  sanskrit: string;
  english: string;
}

interface FillBlankQuestion {
  type: "fill";
  prompt: string;
  blankDisplay: string;
  options: string[];
  correctAnswer: string;
}

interface MultipleChoiceQuestion {
  type: "mcq";
  prompt: string;
  options: string[];
  correctAnswer: string;
}

type Question = FillBlankQuestion | MultipleChoiceQuestion;

interface Scene {
  title: string;
  dialogues: DialogueStep[];
  question: Question;
}

// ─── Lesson Data ────────────────────────────────────────────────────
const scenes: Scene[] = [
  {
    title: "Morning in the Gurukul",
    dialogues: [
      { speaker: "teacher", sanskrit: "स्वागतम्, बालक!", english: "Welcome, child!" },
      { speaker: "monkey", sanskrit: "नमस्ते, गुरुमाता!", english: "Namaste, respected teacher!" },
    ],
    question: {
      type: "fill",
      prompt: "In Sanskrit, how do we say Welcome?",
      blankDisplay: "स्वा___म्",
      options: ["गतम्", "गतः", "गता"],
      correctAnswer: "गतम्",
    },
  },
  {
    title: "Learning Begins",
    dialogues: [
      { speaker: "teacher", sanskrit: "आज हम स्वराः सीखेंगे।", english: "Today we will learn vowels." },
      { speaker: "monkey", sanskrit: "गुरुमाता, 'अश्वः' का अर्थ क्या है?", english: "Teacher, what is the meaning of 'अश्वः'?" },
      { speaker: "teacher", sanskrit: "अश्वः। It means Horse.", english: "" },
    ],
    question: {
      type: "mcq",
      prompt: "What does अश्वः mean?",
      options: ["Mango", "Horse", "Sage"],
      correctAnswer: "Horse",
    },
  },
  {
    title: "Respect and Culture",
    dialogues: [
      { speaker: "teacher", sanskrit: "When we greet someone respectfully, we say __.", english: "" },
    ],
    question: {
      type: "mcq",
      prompt: "How do we greet someone respectfully?",
      options: ["धन्यवाद", "नमस्ते", "शुभरात्रि"],
      correctAnswer: "नमस्ते",
    },
  },
  {
    title: "Mini Dialogue Practice",
    dialogues: [
      { speaker: "teacher", sanskrit: "Repeat after me:", english: "" },
      { speaker: "teacher", sanskrit: "नमस्ते। अहं विद्यार्थी अस्मि।", english: "I am a student." },
    ],
    question: {
      type: "fill",
      prompt: "Fill in the blank: अहं ___ अस्मि।",
      blankDisplay: "अहं ___ अस्मि।",
      options: ["विद्यार्थी", "गुरु", "अश्वः"],
      correctAnswer: "विद्यार्थी",
    },
  },
];

// ─── Sub-components ─────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-muted-foreground font-display">
          Step {current + 1}/{total}
        </span>
        <span className="text-sm font-bold text-gurukul-saffron font-display">
           Sanskrit Lesson
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function SpeechBubble({ side, sanskrit, english }: { side: "left" | "right"; sanskrit: string; english: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative max-w-[70%] px-5 py-4 rounded-2xl shadow-md ${
        side === "left"
          ? "bg-card border-2 border-gurukul-saffron/30 rounded-bl-sm ml-[-20px]"
          : "bg-secondary/20 border-2 border-gurukul-teal/30 rounded-br-sm mr-[-20px]"
      }`}
    >
      <p className="font-devanagari font-bold text-foreground text-base leading-relaxed">{sanskrit}</p>
      {english && <p className="text-sm text-muted-foreground mt-1 font-display">{english}</p>}
    </motion.div>
  );
}

function DialogueRow({ step }: { step: DialogueStep }) {
  const isTeacher = step.speaker === "teacher";

  return (
    <div className={`flex items-end gap-0 mb-4 ${isTeacher ? "flex-row" : "flex-row-reverse"}`}>
      <img
        src={isTeacher ? teacherScriptImg : monkeySitImg}
        alt={isTeacher ? "Teacher" : "Monkey"}
        className="h-[120px] md:h-[160px] object-contain flex-shrink-0 z-10"
      />
      <SpeechBubble
        side={isTeacher ? "left" : "right"}
        sanskrit={step.sanskrit}
        english={step.english}
      />
    </div>
  );
}

function XPAnimation({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: -80, scale: 1.3 }}
        transition={{ duration: 1.5 }}
        className="text-3xl font-bold text-gurukul-xp drop-shadow-lg font-display"
      >
        +10 XP 
      </motion.div>
    </div>
  );
}

function MonkeyReaction({ state }: { state: "idle" | "correct" | "wrong" }) {
  const img =
    state === "correct"
      ? monkeyCorrectImg
      : state === "wrong"
      ? monkeyCryingImg
      : monkeySitImg;

  return (
    <motion.img
      key={state}
      src={img}
      alt="Monkey reaction"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: state === "wrong" ? 1.15 : 1, opacity: 1 }}
      className={`h-[160px] md:h-[200px] object-contain mx-auto ${
        state === "wrong" ? "animate-bounce-shake" : ""
      }`}
    />
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function GurukulLesson() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [phase, setPhase] = useState<"dialogue" | "question" | "feedback">("dialogue");
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">("idle");
  const [xp, setXp] = useState(0);
  const [showXp, setShowXp] = useState(false);
  const [finished, setFinished] = useState(false);

  const scene = scenes[sceneIdx];
  const dialoguesShown = scene.dialogues.slice(0, dialogueIdx + 1);
  const navigate = useNavigate();
  const advanceDialogue = useCallback(() => {
    if (dialogueIdx < scene.dialogues.length - 1) {
      setDialogueIdx((i) => i + 1);
    } else {
      setPhase("question");
    }
  }, [dialogueIdx, scene.dialogues.length]);

  const handleAnswer = (answer: string) => {
    if (answerState === "correct") return;
    setSelected(answer);
    const correct = scene.question.correctAnswer;
    if (answer === correct) {
      setAnswerState("correct");
      setXp((x) => x + 10);
      setShowXp(true);
      setTimeout(() => setShowXp(false), 1500);
    } else {
      setAnswerState("wrong");
    }
  };

  const nextScene = () => {
    if (sceneIdx < scenes.length - 1) {
      setSceneIdx((i) => i + 1);
      setDialogueIdx(0);
      setPhase("dialogue");
      setSelected(null);
      setAnswerState("idle");
    } else {
      setFinished(true);
    }
  };

  const tryAgain = () => {
    setSelected(null);
    setAnswerState("idle");
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-3xl shadow-xl p-8 text-center max-w-md w-full border-2 border-gurukul-gold/40"
        >
          <img src={monkeyCorrectImg} alt="Celebration" className="h-[200px] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground font-display mb-2">🎉 Lesson Complete!</h2>
          <p className="text-xl text-gurukul-saffron font-bold font-display mb-4">Total XP: {xp} ⭐</p>
          <p className="text-muted-foreground font-display">You've completed the Sanskrit Gurukul lesson!</p>
          <button
            onClick={() => { setSceneIdx(0); setDialogueIdx(0); setPhase("dialogue"); setSelected(null); setAnswerState("idle"); setXp(0); setFinished(false); }}
            className="mt-6 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold font-display text-lg hover:opacity-90 transition-opacity"
          >
            Restart Lesson
          </button>
          <button
          onClick={() => navigate("/dashboard")}
          className="mt-3 px-8 py-3 rounded-2xl bg-muted text-foreground font-bold font-display text-lg hover:bg-muted/80 transition-colors"
        >
          Exit to Dashboard
        </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="gurukul-theme min-h-screen bg-background p-4 md:p-8 flex flex-col items-center font-display">
      <XPAnimation show={showXp} />

      <div className="w-full max-w-2xl">
        
        {/* NEW: Top Row with Back Button and XP Counter */}
        <div className="flex justify-between items-center mb-4 w-full">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")} 
            className="text-muted-foreground hover:text-foreground pl-0 md:-ml-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Button>

          <span className="text-base md:text-lg font-extrabold text-gurukul-gold font-display flex items-center gap-1">
            ⭐ {xp} XP
          </span>
        </div>

        <ProgressBar current={sceneIdx} total={scenes.length} />

        {/* Scene Title */}
        <motion.h2
          key={sceneIdx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl md:text-2xl font-bold text-foreground mb-6 font-display"
        >
           {scene.title}
        </motion.h2>

       {/* Dialogues */}
<AnimatePresence mode="wait">
  <div className="space-y-2">
    {dialoguesShown.map((d, i) => (
      <DialogueRow key={`${sceneIdx}-${i}`} step={d} />
    ))}
  </div>
</AnimatePresence>

        {/* Continue / Next Dialogue Button */}
        {phase === "dialogue" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-6">
            <button
              onClick={advanceDialogue}
              className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              {dialogueIdx < scene.dialogues.length - 1 ? "Continue" : "Start Quiz →"}
            </button>
          </motion.div>
        )}

        {/* Question Phase */}
        {phase === "question" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-card rounded-3xl shadow-xl p-6 border-2 border-border"
          >
            {/* Monkey reaction */}
            <MonkeyReaction state={answerState} />

            {answerState === "wrong" && (
              <p className="text-center text-destructive font-bold font-display mt-2 text-lg">
                Try Again! 
              </p>
            )}
            {answerState === "correct" && (
              <p className="text-center text-gurukul-success font-bold font-display mt-2 text-lg">
                Correct! 
              </p>
            )}

            <h3 className="text-lg font-bold text-foreground mt-4 mb-2 font-display">{scene.question.prompt}</h3>

            {scene.question.type === "fill" && (
              <p className="text-xl font-devanagari font-bold text-foreground mb-4 text-center bg-muted/50 py-3 rounded-xl">
                {selected && answerState === "correct"
                  ? (scene.question as FillBlankQuestion).blankDisplay.replace("__", selected).replace("__", selected)
                  : (scene.question as FillBlankQuestion).blankDisplay}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 mt-4">
              {scene.question.options.map((opt) => {
                const isSelected = selected === opt;
                const isCorrect = opt === scene.question.correctAnswer;
                let borderClass = "border-border";
                if (isSelected && answerState === "wrong") borderClass = "border-destructive border-2";
                if (isSelected && answerState === "correct") borderClass = "border-gurukul-success border-2";

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={answerState === "correct"}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all
                      ${borderClass} border-2
                      ${isSelected && answerState === "correct" ? "bg-gurukul-success/10 text-foreground" : ""}
                      ${isSelected && answerState === "wrong" ? "bg-destructive/10 text-foreground" : ""}
                      ${!isSelected ? "bg-card text-foreground hover:bg-muted/50" : ""}
                      ${answerState === "correct" ? "cursor-default" : "cursor-pointer hover:shadow-md"}
                      font-devanagari
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answerState === "wrong" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-4">
                <button
                  onClick={tryAgain}
                  className="px-6 py-2 rounded-xl bg-muted text-foreground font-bold font-display hover:bg-muted/80 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {answerState === "correct" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-4">
                <button
                  onClick={nextScene}
                  className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity shadow-lg font-display"
                >
                  {sceneIdx < scenes.length - 1 ? "Next Scene →" : "Finish Lesson 🎉"}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}