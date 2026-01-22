import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Volume2, RotateCcw, X, CheckCircle2, Play, Loader2, HelpCircle, Lock } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { useUserProgress } from "@/context/UserProgressContext"; 
import AnimatedMouth from "@/components/AnimatedTeacher"; 

// --- TYPES ---
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
  const { lectureId } = useParams<{ lectureId: string; }>();
  const navigate = useNavigate();
  const { completeLesson, progress: userProgress } = useUserProgress();

  const [lessonSlides, setLessonSlides] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert numeric lesson ID to LS001 format
  const getFormattedLectureId = (id: string | undefined): string => {
    if (!id) return "LS001";
    if (id.startsWith("LS")) return id;
    const num = parseInt(id);
    if (!isNaN(num)) {
      return `LS${num.toString().padStart(3, "0")}`;
    }
    return "LS001";
  };

  const currentLectureId = getFormattedLectureId(lectureId);
  const lessonNumber = Number(currentLectureId.replace("LS", ""));

  // --- FETCH LESSON DATA ---
  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const url = `${API_URL}/lesson-content/${currentLectureId}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data: Lesson[] = await res.json();
        if (!data || data.length === 0) {
          setLessonSlides([]);
          return;
        }

        data.sort((a, b) => a.order - b.order);
        setLessonSlides(data);
      } catch (err: any) {
        console.error("Failed to load lesson content", err);
        setLessonSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonContent();
  }, [currentLectureId]);

  // --- STATES ---
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  
  // --- QUIZ STATES ---
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [finalPercentage, setFinalPercentage] = useState(0);

  // --- AUDIO STATES ---
  const [hasStarted, setHasStarted] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isVoicesLoaded, setIsVoicesLoaded] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setIsVoicesLoaded(true);
      }
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    const timeout = setTimeout(loadVoices, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setCurrentLessonIndex(0);
    setIsQuizMode(false);
    setShowCompletion(false);
    setHasStarted(false);
    setQuizScore(0);
    setCurrentQuestionIndex(0);
  }, [lectureId]);

  const currentLessonData = lessonSlides;
  const currentLesson = currentLessonData[currentLessonIndex];
  const totalLessons = currentLessonData.length;
  const hasContent = totalLessons > 0 && currentLesson;
  
  const progressPercent = isQuizMode 
    ? 90 + ((currentQuestionIndex / 5) * 10)
    : ((currentLessonIndex + 1) / totalLessons) * 90;

  const playAudio = useCallback(() => {
    if (!window.speechSynthesis || voices.length === 0 || !currentLesson) return;

    window.speechSynthesis.cancel(); 
    const textToSpeak = `${currentLesson.sanskrit} ... ${currentLesson.word}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const hindiVoice = voices.find(v => v.lang === "hi-IN" || v.name.includes("Hindi"));
    const defaultVoice = voices.find(v => v.default) || voices[0];

    if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = "hi-IN";
    } else {
        utterance.voice = defaultVoice;
    }

    utterance.rate = 0.8; 
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  }, [currentLesson, voices]);

  useEffect(() => {
    if (hasStarted && isVoicesLoaded && !showCompletion && !isQuizMode && currentLesson) {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => {
        clearTimeout(timer);
        window.speechSynthesis.cancel();
      };
    }
  }, [currentLessonIndex, hasStarted, isVoicesLoaded, playAudio, showCompletion, isQuizMode, currentLesson]);

  const generateQuiz = () => {
    const shuffledData = [...currentLessonData].sort(() => 0.5 - Math.random());
    const selectedItems = shuffledData.slice(0, 5);

    const questions: Question[] = selectedItems.map((item) => {
      const wrongOptions = currentLessonData
        .filter(l => l._id !== item._id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(l => l.exampleMeaning);

      return {
        question: `What does "${item.word}" (${item.sanskrit}) mean?`,
        correctAnswer: item.exampleMeaning,
        options: [...wrongOptions, item.exampleMeaning].sort(() => 0.5 - Math.random())
      };
    });

    setQuizQuestions(questions);
    setIsQuizMode(true);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
  };

  const handleAnswer = (selectedOption: string) => {
    let newScore = quizScore;
    if (selectedOption === quizQuestions[currentQuestionIndex].correctAnswer) {
        newScore = quizScore + 1;
        setQuizScore(newScore);
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        finishLesson(newScore);
    }
  };

  const finishLesson = (finalScore: number) => {
    const percentage = (finalScore / 5) * 100;
    setFinalPercentage(percentage);
    
    if (percentage >= 75) {
        setPassed(true);
        const orderedLessonIds = Array.from({ length: 5 }, (_, i) => `LS${(i + 1).toString().padStart(3, "0")}`);
        completeLesson(currentLectureId, percentage, orderedLessonIds);
    } else {
        setPassed(false);
    }
    setShowCompletion(true);
  };

  const handleNext = () => {
    if (currentLessonIndex < totalLessons - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else {
      generateQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) setCurrentLessonIndex(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && !hasContent && lessonSlides.length === 0) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center bg-card rounded-3xl shadow-elevated border-0">
          <CardContent className="p-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Lesson Content Not Available</h2>
            <Link to="/dashboard">
              <Button size="lg" className="w-full rounded-xl">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // First lesson (LS001) is always unlocked
  const isFirstLesson = currentLectureId === 'LS001' || lessonNumber === 1;
  const isLocked = !isFirstLesson && !userProgress.unlockedLessons.includes(currentLectureId);

  if (isLocked) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center bg-card rounded-3xl shadow-elevated border-0">
          <CardContent className="p-10">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Lesson Locked</h2>
            <p className="text-muted-foreground mb-8">
              Complete the previous lesson to access this one.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="w-full rounded-xl">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-6 overflow-hidden">
        <Card className="max-w-md w-full text-center animate-scale-in bg-card rounded-3xl shadow-elevated border-0">
          <CardContent className="p-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              {isVoicesLoaded ? "Ready to Learn!" : "Loading Audio..."}
            </h2>
            <Button 
              size="lg" className="w-full text-lg font-bold rounded-xl"
              onClick={() => {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("")); // Hard Reset
                setTimeout(() => setHasStarted(true), 100);
              }}
              disabled={!isVoicesLoaded}
            >
              {isVoicesLoaded ? <><Play className="w-5 h-5 mr-2" /> Start Lesson</> : "Loading..."}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isQuizMode && !showCompletion) {
    const q = quizQuestions[currentQuestionIndex];
    return (
        <div className="h-screen w-full bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
            <Card className="max-w-xl w-full animate-scale-in shadow-elevated max-h-full overflow-y-auto">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Quiz: Question {currentQuestionIndex + 1} / 5</span>
                        <HelpCircle className="text-accent" />
                    </CardTitle>
                    <Progress value={(currentQuestionIndex / 5) * 100} className="h-2" />
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <h3 className="text-2xl font-bold text-center text-foreground">{q.question}</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {q.options.map((opt, idx) => (
                            <Button 
                                key={idx} 
                                variant="outline" 
                                className="h-14 text-lg justify-start px-6 hover:bg-primary/10 hover:text-primary border-2"
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-6 overflow-hidden">
        <Card className="max-w-md w-full text-center animate-scale-in bg-card rounded-3xl shadow-elevated border-0 max-h-full overflow-y-auto">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <InteractiveMascot 
                mood={passed ? "celebrate" : "sad"} 
                size="xl" 
                messages={passed ? ["You did it! 🎉", "Excellent! ⭐"] : ["Don't give up! 😔", "Try again!"]} 
              />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {passed ? "Lesson Mastered! 🎉" : "Keep Practicing! 💪"}
            </h2>
            <div className="mb-6 p-4 bg-muted/20 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Final Score</p>
                <p className={`text-4xl font-bold ${passed ? "text-success" : "text-destructive"}`}>
                    {finalPercentage}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    {passed ? "You passed! (>75%)" : "You need 75% to unlock the next lesson."}
                </p>
            </div>
            <div className="space-y-3">
                {passed && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Continue Learning <ArrowRight className="ml-2 w-4 h-4"/>
                  </Button>
                )}
                {!passed && (
                    <Button variant="default" className="w-full" onClick={() => {
                        setIsQuizMode(false);
                        setShowCompletion(false);
                        setCurrentLessonIndex(0);
                        setQuizScore(0);
                        setCurrentQuestionIndex(0);
                    }}>
                        <RotateCcw className="mr-2 w-4 h-4"/> Retry Lesson
                    </Button>
                )}
                <Button variant="secondary" className="w-full" onClick={() => navigate("/dashboard")}>
                    Return to Dashboard
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FONT SIZE HELPER (UPDATED: Made much smaller)
  const getFontSizeClass = () => {
    if (lessonNumber <= 3) return "text-6xl md:text-7xl"; // Was 9xl
    return "text-4xl md:text-5xl"; // Was 6xl/7xl
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="flex-none bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* BACK BUTTON (Restored from previous request) */}
            <Link to="/lectures">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Lessons
              </Button>
            </Link>
            
            <span className="text-sm font-semibold text-muted-foreground">
              Lecture {currentLectureId} • Slide {currentLessonIndex + 1} of {totalLessons}
            </span>
            <div className="w-20" /> 
          </div>
          <Progress value={progressPercent} variant="accent" size="sm" />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col justify-center p-4 overflow-hidden">
        <div className="w-full max-w-5xl h-full max-h-[600px] grid grid-cols-1 lg:grid-cols-2 gap-6 mx-auto">
            
            {/* Visual Section - NOW WITH SMALLER MOUTH */}
            <Card variant="elevated" className="h-full overflow-hidden flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center relative p-6">
                
                {/* SMALLER MOUTH CONTAINER (h-48, w-48) */}
                <div className="h-48 w-full mb-4 flex justify-center items-center">
                    <div className="w-48 h-48 bg-card/50 rounded-full shadow-inner p-4 border-4 border-primary/20"> 
                        <AnimatedMouth 
                            isSpeaking={isPlaying} 
                            text={(currentLesson?.sanskrit || "") + " " + (currentLesson?.word || "")} 
                        />
                    </div>
                </div>

                <h1 className={`${getFontSizeClass()} font-display font-bold text-primary animate-scale-in text-center`}>
                    {currentLesson?.sanskrit || ""}
                </h1>
                {lessonNumber <= 3 && currentLesson?.word && (
                  <p className="text-2xl text-foreground/60 mt-4 font-semibold animate-fade-in">
                      {currentLesson.word}
                  </p>
                )}
                {lessonNumber > 3 && currentLesson?.transliteration && (
                   <p className="text-lg text-muted-foreground mt-2">{currentLesson.transliteration}</p>
                )}
              </div>
            </Card>
            
            {/* Meaning & Audio Section */}
            <div className="h-full flex flex-col gap-6">
              <Card variant="elevated" className="flex-1 flex flex-col justify-center text-center">
                <CardContent className="p-8">
                  <div className="text-4xl text-foreground font-semibold mb-2">
                    {currentLesson?.transliteration || ""}
                  </div>
                  <p className="text-lg text-muted-foreground">{currentLesson?.meaning || ""}</p>
                </CardContent>
              </Card>

              <Card variant="default" className="flex-none">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">Example / Usage:</h4>
                  <p className="text-xl text-primary font-bold">{currentLesson?.word || ""}</p>
                  <p className="text-lg text-muted-foreground">{currentLesson?.exampleMeaning || ""}</p>
                </CardContent>
              </Card>
              
              <div className="flex-none flex gap-4">
                <Button 
                  variant={isPlaying ? "default" : "default"} 
                  size="lg" 
                  className={`flex-1 transition-all py-6 text-lg ${isPlaying ? "opacity-80" : ""}`}
                  onClick={() => playAudio()}
                  disabled={isPlaying || !currentLesson}
                >
                  <Volume2 className={`w-6 h-6 mr-2 ${isPlaying ? "animate-pulse" : ""}`} /> 
                  {isPlaying ? "Playing..." : "Listen Again"}
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="px-6"
                  onClick={() => playAudio()}
                  disabled={isPlaying || !currentLesson}
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
              </div>
            </div>
        </div>
      </main>
      
      <footer className="flex-none bg-card border-t border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button variant="secondary" onClick={handlePrevious} disabled={currentLessonIndex === 0}>
              <ArrowLeft className="w-5 h-5 mr-2" /> Previous
            </Button>
            <Button variant="default" onClick={handleNext}>
              {currentLessonIndex === totalLessons - 1 ? "Take Quiz" : "Next"} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LessonPlayer;