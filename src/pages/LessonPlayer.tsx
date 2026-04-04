import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Volume2, RotateCcw, Lock, Loader2, HelpCircle } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { useUserProgress } from "@/context/UserProgressContext";
import Avatar, { AvatarHandle } from "../components/Avatar"; 

interface Lesson {
  _id: string;
  LessonID: string;
  order: number;
  contentType: "Slide" | "Dialogue" | "Question";
  sanskrit: string;
  word: string;
  transliteration: string;
  meaning: string;
  exampleMeaning: string;
}

interface Question {
  question: string;
  correctAnswer: string;
  options: string[];
}

const LessonPlayer = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const { completeLesson, progress: userProgress } = useUserProgress();
  
  // 3D Guru Ref
  const avatarRef = useRef<AvatarHandle>(null);

  const [lessonSlides, setLessonSlides] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [passed, setPassed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [finalPercentage, setFinalPercentage] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const getFormattedLectureId = (id: string | undefined): string => {
    if (!id) return "LS001";
    if (id.startsWith("LS")) return id;
    const num = parseInt(id);
    return !isNaN(num) ? `LS${num.toString().padStart(3, "0")}` : "LS001";
  };

  const currentLectureId = getFormattedLectureId(lectureId);
  const lessonNumber = Number(currentLectureId.replace("LS", ""));

  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/lesson-content/${currentLectureId}`);
        const data: Lesson[] = await res.json();
        setLessonSlides(data.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonContent();
  }, [currentLectureId]);

  // Handle Speech via 3D Guru Ref
  const playAudio = useCallback(() => {
    if (!lessonSlides[currentLessonIndex]) return;
    const current = lessonSlides[currentLessonIndex];
    const fullText = `${current.sanskrit} ... ${current.word}`;
    
    // Set local state for UI pulse effect
    setIsPlaying(true);
    avatarRef.current?.speak(fullText);
    
    // Reset pulse after approximate reading time
    setTimeout(() => setIsPlaying(false), 3000);
  }, [currentLessonIndex, lessonSlides]);

  useEffect(() => {
    if (hasStarted && !showCompletion && !isQuizMode && lessonSlides[currentLessonIndex]) {
      const timer = setTimeout(playAudio, 800);
      return () => clearTimeout(timer);
    }
  }, [currentLessonIndex, hasStarted, playAudio, showCompletion, isQuizMode]);

  const generateQuiz = () => {
    const shuffled = [...lessonSlides].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, 5);
    const questions: Question[] = selectedItems.map(item => ({
      question: `What does "${item.word}" (${item.sanskrit}) mean?`,
      correctAnswer: item.exampleMeaning,
      options: [
        item.exampleMeaning, 
        ...lessonSlides.filter(l => l._id !== item._id).sort(() => 0.5 - Math.random()).slice(0, 3).map(l => l.exampleMeaning)
      ].sort(() => 0.5 - Math.random())
    }));
    setQuizQuestions(questions);
    setIsQuizMode(true);
  };

  const handleAnswer = (selected: string) => {
    const isCorrect = selected === quizQuestions[currentQuestionIndex].correctAnswer;
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    setQuizScore(newScore);
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishLesson(newScore);
    }
  };

  const finishLesson = (finalScore: number) => {
    const percentage = (finalScore / 5) * 100;
    setFinalPercentage(percentage);
    
    if (percentage >= 70) { // Using your 70% requirement
      setPassed(true);
      // DYNAMIC UNLOCK: We generate the list of IDs from 1 to 50 (or your max)
      const allPossibleLessonIds = Array.from({ length: 50 }, (_, i) => `LS${(i + 1).toString().padStart(3, "0")}`);
      completeLesson(currentLectureId, percentage, allPossibleLessonIds);
    } else {
      setPassed(false);
    }
    setShowCompletion(true);
  };

  const handleNext = () => {
    if (currentLessonIndex < lessonSlides.length - 1) setCurrentLessonIndex(prev => prev + 1);
    else generateQuiz();
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) setCurrentLessonIndex(prev => prev - 1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  const isFirstLesson = currentLectureId === 'LS001' || lessonNumber === 1;
  const isLocked = !isFirstLesson && !userProgress.unlockedLessons.includes(currentLectureId);

  if (isLocked) return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center bg-card rounded-3xl shadow-elevated border-0 p-10">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Lesson Locked</h2>
        <p className="mb-8 text-muted-foreground">Complete the previous lesson to access this one.</p>
        <Button onClick={() => navigate("/dashboard")} className="w-full">Back to Dashboard</Button>
      </Card>
    </div>
  );

  if (!hasStarted) return (
    <div className="h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full p-10 text-center shadow-xl">
        <h2 className="text-3xl font-bold mb-6">Lecture {currentLectureId}</h2>
        <Button size="lg" className="w-full text-xl py-6" onClick={() => setHasStarted(true)}>Start Lesson</Button>
      </Card>
    </div>
  );

  if (isQuizMode && !showCompletion) {
    const q = quizQuestions[currentQuestionIndex];
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-background overflow-hidden">
        <Card className="max-w-xl w-full p-10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">Question {currentQuestionIndex + 1} / 5</CardTitle>
            <Progress value={(currentQuestionIndex / 5) * 100} className="h-2" />
          </CardHeader>
          <h3 className="text-2xl font-bold text-center mb-10">{q.question}</h3>
          <div className="grid gap-4">
            {q.options.map((opt, i) => (
              <Button key={i} variant="outline" className="h-16 text-lg" onClick={() => handleAnswer(opt)}>{opt}</Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (showCompletion) return (
    <div className="h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full p-12 text-center shadow-2xl">
        <InteractiveMascot mood={passed ? "celebrate" : "sad"} size="xl" />
        <h2 className="text-4xl font-bold mt-8">{passed ? "Success! 🎉" : "Keep Practicing! 💪"}</h2>
        <p className="text-5xl font-bold my-6 text-primary">{finalPercentage}%</p>
        <div className="space-y-4 pt-4">
          <Button className="w-full py-6 text-lg" onClick={() => passed ? navigate("/dashboard") : window.location.reload()}>
            {passed ? "Continue Learning" : "Retry Lesson"}
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="flex-none bg-card border-b py-3 px-6 shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/lectures"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></Link>
          <div className="text-center">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Lecture {currentLectureId}</span>
            <p className="text-[10px] text-muted-foreground">Slide {currentLessonIndex + 1} of {lessonSlides.length}</p>
          </div>
          <div className="w-20" /> 
        </div>
        <div className="max-w-6xl mx-auto mt-2">
          <Progress value={((currentLessonIndex + 1) / lessonSlides.length) * 100} variant="accent" className="h-1" />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col justify-center p-4 md:p-6 overflow-hidden min-h-0">
        <div className="w-full max-w-6xl h-full max-h-[600px] flex flex-col lg:flex-row gap-5 mx-auto min-h-0">
            
            <Card className="flex-[1.3] flex flex-col border-primary/10 shadow-lg bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
              <div className="flex-[5] relative min-h-0">
                <div className="absolute inset-0">
                  <Avatar ref={avatarRef} />
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center text-center p-4 border-t bg-card/40 backdrop-blur-sm">
                <h1 className={`${lessonNumber <= 3 ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl"} font-display font-bold text-primary select-none drop-shadow-sm tracking-tight`}>
                  {lessonSlides[currentLessonIndex]?.sanskrit}
                </h1>
              </div>
            </Card>
            
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <Card className="flex-1 flex flex-col justify-center text-center p-8 border-primary/5 shadow-sm">
                  <div className="text-5xl text-foreground font-semibold mb-3 tracking-tight">
                    {lessonSlides[currentLessonIndex]?.transliteration}
                  </div>
                  <p className="text-2xl text-muted-foreground italic font-medium">
                    "{lessonSlides[currentLessonIndex]?.meaning}"
                  </p>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary bg-card/60 shadow-sm">
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Word Context</h4>
                  <p className="text-3xl text-foreground font-bold mb-1">{lessonSlides[currentLessonIndex]?.word}</p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {lessonSlides[currentLessonIndex]?.exampleMeaning}
                  </p>
              </Card>

              <div className="flex gap-3 h-16 shrink-0">
                <Button variant="default" size="lg" className="flex-1 h-full text-2xl shadow-xl transition-all active:scale-95" onClick={playAudio} disabled={isPlaying}>
                  <Volume2 className={`w-7 h-7 mr-3 ${isPlaying ? 'animate-pulse' : ''}`} /> 
                  {isPlaying ? 'Speaking...' : 'Listen'}
                </Button>
                <Button variant="secondary" size="lg" className="px-10 h-full shadow-md" onClick={playAudio}>
                  <RotateCcw className="w-6 h-6" />
                </Button>
              </div>
            </div>
        </div>
      </main>

      <footer className="flex-none bg-card border-t py-4 px-6 shadow-inner z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="outline" size="sm" className="h-10 px-6 border-2 font-semibold" onClick={handlePrevious} disabled={currentLessonIndex === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button size="sm" className="h-10 px-8 text-md shadow-lg font-semibold" onClick={handleNext}>
            {currentLessonIndex === lessonSlides.length - 1 ? "Start Quiz" : "Next Slide"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default LessonPlayer;