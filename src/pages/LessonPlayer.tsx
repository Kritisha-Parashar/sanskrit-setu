import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Volume2, RotateCcw, X, CheckCircle2, Play, Loader2, HelpCircle, Lock } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { useUserProgress } from "@/context/UserProgressContext"; 
import AnimatedMouth from "@/components/AnimatedTeacher"; // <--- NEW COMPONENT

// --- TYPES ---
interface Lesson {
  id: number;
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

// --- CURRICULUM DATA ---
const courseData: Record<number, Lesson[]> = {
  // Lesson 1: Swar
  1: [
    { id: 1, sanskrit: "अ", word: "अश्वः", transliteration: "a", meaning: "Short 'a'", exampleMeaning: "Horse" },
    { id: 2, sanskrit: "आ", word: "आम्रम्", transliteration: "ā", meaning: "Long 'aa'", exampleMeaning: "Mango" },
    { id: 3, sanskrit: "इ", word: "इक्षुः", transliteration: "i", meaning: "Short 'i'", exampleMeaning: "Sugarcane" },
    { id: 4, sanskrit: "ई", word: "ईश्वरः", transliteration: "ī", meaning: "Long 'ee'", exampleMeaning: "God" },
    { id: 5, sanskrit: "उ", word: "उष्ट्रः", transliteration: "u", meaning: "Short 'u'", exampleMeaning: "Camel" },
    { id: 6, sanskrit: "ऊ", word: "ऊर्णा", transliteration: "ū", meaning: "Long 'oo'", exampleMeaning: "Wool" },
    { id: 7, sanskrit: "ऋ", word: "ऋषिः", transliteration: "ṛ", meaning: "Vocalic 'ri'", exampleMeaning: "Sage" },
    { id: 8, sanskrit: "ए", word: "एला", transliteration: "e", meaning: "Sound 'ay'", exampleMeaning: "Cardamom" },
    { id: 9, sanskrit: "ऐ", word: "ऐरावत", transliteration: "ai", meaning: "Sound 'ai'", exampleMeaning: "Elephant" },
    { id: 10, sanskrit: "ओ", word: "ओष्ठ", transliteration: "o", meaning: "Sound 'o'", exampleMeaning: "Lip" },
    { id: 11, sanskrit: "औ", word: "औषधम्", transliteration: "au", meaning: "Sound 'au'", exampleMeaning: "Medicine" },
    { id: 12, sanskrit: "अं", word: "अंशुमान", transliteration: "am", meaning: "Nasal 'am'", exampleMeaning: "Sun" },
    { id: 13, sanskrit: "अः", word: "पुनः", transliteration: "ah", meaning: "Visarga 'ah'", exampleMeaning: "Again" },
  ],
  // Lesson 2: Consonants Part 1
  2: [
    { id: 1, sanskrit: "क", word: "कमलम्", transliteration: "ka", meaning: "Guttural", exampleMeaning: "Lotus" },
    { id: 2, sanskrit: "ख", word: "खगः", transliteration: "kha", meaning: "Aspirated K", exampleMeaning: "Bird" },
    { id: 3, sanskrit: "ग", word: "गणेशः", transliteration: "ga", meaning: "Voiced G", exampleMeaning: "Elephant" },
    { id: 4, sanskrit: "घ", word: "घटः", transliteration: "gha", meaning: "Voiced Asp G", exampleMeaning: "Pot" },
    { id: 5, sanskrit: "ङ", word: "वाङ्मय", transliteration: "nga", meaning: "Nasal G", exampleMeaning: "Literature" },
    { id: 6, sanskrit: "च", word: "चषकम", transliteration: "cha", meaning: "Palatal Ch", exampleMeaning: "Cup" },
    { id: 7, sanskrit: "छ", word: "छत्रम्", transliteration: "chha", meaning: "Aspirated Ch", exampleMeaning: "Umbrella" },
    { id: 8, sanskrit: "ज", word: "जलम्", transliteration: "ja", meaning: "Voiced J", exampleMeaning: "Water" },
    { id: 9, sanskrit: "झ", word: "झषः", transliteration: "jha", meaning: "Voiced Asp J", exampleMeaning: "Fish" },
    { id: 10, sanskrit: "ञ", word: "चञ्चु", transliteration: "nya", meaning: "Nasal Palatal", exampleMeaning: "Beak" },
    { id: 11, sanskrit: "ट", word: "टङ्कः", transliteration: "ṭa", meaning: "Retroflex T", exampleMeaning: "Axe" },
    { id: 12, sanskrit: "ठ", word: "ठक्कुरः", transliteration: "ṭha", meaning: "Aspirated T", exampleMeaning: "Deity" },
    { id: 13, sanskrit: "ड", word: "डमरू", transliteration: "ḍa", meaning: "Voiced D", exampleMeaning: "Drum" },
    { id: 14, sanskrit: "ढ", word: "ढक्का", transliteration: "ḍha", meaning: "Voiced Asp D", exampleMeaning: "Big Drum" },
    { id: 15, sanskrit: "ण", word: "बाणः", transliteration: "ṇa", meaning: "Retroflex N", exampleMeaning: "Arrow" },
    { id: 16, sanskrit: "त", word: "तरुः", transliteration: "ta", meaning: "Dental T", exampleMeaning: "Tree" },
    { id: 17, sanskrit: "थ", word: "पथः", transliteration: "tha", meaning: "Aspirated T", exampleMeaning: "Path" },
    { id: 18, sanskrit: "द", word: "दीपकः", transliteration: "da", meaning: "Voiced D", exampleMeaning: "Lamp" },
    { id: 19, sanskrit: "ध", word: "धनुः", transliteration: "dha", meaning: "Voiced Asp D", exampleMeaning: "Bow" },
    { id: 20, sanskrit: "न", word: "नदी", transliteration: "na", meaning: "Dental N", exampleMeaning: "River" },
  ],
  // Lesson 3: Consonants Part 2
  3: [
    { id: 1, sanskrit: "प", word: "पर्णम्", transliteration: "pa", meaning: "Labial P", exampleMeaning: "Leaf" },
    { id: 2, sanskrit: "फ", word: "फलम्", transliteration: "pha", meaning: "Aspirated P", exampleMeaning: "Fruit" },
    { id: 3, sanskrit: "ब", word: "बकः", transliteration: "ba", meaning: "Voiced B", exampleMeaning: "Crane" },
    { id: 4, sanskrit: "भ", word: "भल्लूकः", transliteration: "bha", meaning: "Voiced Asp B", exampleMeaning: "Bear" },
    { id: 5, sanskrit: "म", word: "मकरः", transliteration: "ma", meaning: "Labial M", exampleMeaning: "Crocodile" },
    { id: 6, sanskrit: "य", word: "यानम्", transliteration: "ya", meaning: "Semi-vowel Y", exampleMeaning: "Vehicle" },
    { id: 7, sanskrit: "र", word: "रथः", transliteration: "ra", meaning: "Semi-vowel R", exampleMeaning: "Chariot" },
    { id: 8, sanskrit: "ल", word: "लता", transliteration: "la", meaning: "Semi-vowel L", exampleMeaning: "Creeper" },
    { id: 9, sanskrit: "व", word: "वनम्", transliteration: "va", meaning: "Semi-vowel V", exampleMeaning: "Forest" },
    { id: 10, sanskrit: "श", word: "शुकः", transliteration: "śa", meaning: "Palatal S", exampleMeaning: "Parrot" },
    { id: 11, sanskrit: "ष", word: "षट्कोण", transliteration: "ṣa", meaning: "Retroflex S", exampleMeaning: "Hexagon" },
    { id: 12, sanskrit: "स", word: "सर्पः", transliteration: "sa", meaning: "Dental S", exampleMeaning: "Snake" },
    { id: 13, sanskrit: "ह", word: "हंसः", transliteration: "ha", meaning: "Glottal H", exampleMeaning: "Swan" },
    { id: 14, sanskrit: "क्ष", word: "क्षेत्रम्", transliteration: "kṣa", meaning: "Conjunct Ksha", exampleMeaning: "Warrior" },
    { id: 15, sanskrit: "त्र", word: "मित्रम्", transliteration: "tra", meaning: "Conjunct Tra", exampleMeaning: "Friend" },
    { id: 16, sanskrit: "ज्ञ", word: "ज्ञानम्", transliteration: "jña", meaning: "Conjunct Gya", exampleMeaning: "Knowledge" },
  ],
  // Lesson 4: Words
  4: [
    { id: 1, sanskrit: "सूर्यः", word: "सूर्यः", transliteration: "Surya", meaning: "Nature", exampleMeaning: "Sun" },
    { id: 2, sanskrit: "चन्द्रः", word: "चन्द्रः", transliteration: "Chandra", meaning: "Nature", exampleMeaning: "Moon" },
    { id: 3, sanskrit: "अग्निः", word: "अग्निः", transliteration: "Agni", meaning: "Element", exampleMeaning: "Fire" },
    { id: 4, sanskrit: "जलम्", word: "जलम्", transliteration: "Jalam", meaning: "Element", exampleMeaning: "Water" },
    { id: 5, sanskrit: "आकाशः", word: "आकाशः", transliteration: "Akashah", meaning: "Element", exampleMeaning: "Sky" },
    { id: 6, sanskrit: "वृक्षः", word: "वृक्षः", transliteration: "Vrikshah", meaning: "Nature", exampleMeaning: "Tree" },
    { id: 7, sanskrit: "पुष्पम्", word: "पुष्पम्", transliteration: "Pushpam", meaning: "Nature", exampleMeaning: "Flower" },
    { id: 8, sanskrit: "फलम्", word: "फलम्", transliteration: "Phalam", meaning: "Food", exampleMeaning: "Fruit" },
    { id: 9, sanskrit: "अन्नम्", word: "अन्नम्", transliteration: "Annam", meaning: "Food", exampleMeaning: "Food/Rice" },
    { id: 10, sanskrit: "बालकः", word: "बालकः", transliteration: "Balakah", meaning: "People", exampleMeaning: "Boy" },
    { id: 11, sanskrit: "बालिका", word: "बालिका", transliteration: "Balika", meaning: "People", exampleMeaning: "Girl" },
    { id: 12, sanskrit: "माता", word: "माता", transliteration: "Mata", meaning: "Family", exampleMeaning: "Mother" },
    { id: 13, sanskrit: "पिता", word: "पिता", transliteration: "Pita", meaning: "Family", exampleMeaning: "Father" },
    { id: 14, sanskrit: "गृहम्", word: "गृहम्", transliteration: "Griham", meaning: "Place", exampleMeaning: "House" },
    { id: 15, sanskrit: "विद्यालयः", word: "विद्यालयः", transliteration: "Vidyalayah", meaning: "Place", exampleMeaning: "School" },
  ],
  // Lesson 5: Sentences
  5: [
    { id: 1, sanskrit: "हरिः ॐ", word: "हरिः ॐ", transliteration: "Harih Om", meaning: "Greeting", exampleMeaning: "Hello" },
    { id: 2, sanskrit: "सुप्रभातम्", word: "सुप्रभातम्", transliteration: "Suprabhatam", meaning: "Greeting", exampleMeaning: "Good Morning" },
    { id: 3, sanskrit: "नमस्ते", word: "नमस्ते", transliteration: "Namaste", meaning: "Greeting", exampleMeaning: "Salutations" },
    { id: 4, sanskrit: "मम नाम", word: "मम नाम ...", transliteration: "Mama Nama...", meaning: "Self", exampleMeaning: "My name is..." },
    { id: 5, sanskrit: "अहं बालकः", word: "अहं बालकः अस्मि", transliteration: "Aham Balakah", meaning: "Self", exampleMeaning: "I am a boy" },
    { id: 6, sanskrit: "एषः विद्यालयः", word: "एषः विद्यालयः", transliteration: "Eshah Vidyalayah", meaning: "Pointing", exampleMeaning: "This is a school" },
    { id: 7, sanskrit: "तत्र वृक्षः", word: "तत्र वृक्षः अस्ति", transliteration: "Tatra Vrikshah", meaning: "Pointing", exampleMeaning: "There is a tree" },
    { id: 8, sanskrit: "जलम् पिबतु", word: "जलम् पिबतु", transliteration: "Jalam Pibatu", meaning: "Action", exampleMeaning: "Drink water" },
    { id: 9, sanskrit: "धन्यवादः", word: "धन्यवादः", transliteration: "Dhanyavadah", meaning: "Politeness", exampleMeaning: "Thank you" },
    { id: 10, sanskrit: "पुनः मिलामः", word: "पुनः मिलामः", transliteration: "Punah Milamah", meaning: "Farewell", exampleMeaning: "See you again" },
  ]
};

  const LessonPlayer = () => {
  const { lectureId } = useParams<{
  lectureId: string;}>();

  const navigate = useNavigate();
  const { completeLesson, progress: userProgress } = useUserProgress();
  
  const currentLectureId = lectureId ? parseInt(lectureId) : 1;
  const currentLessonData = courseData[currentLectureId] || courseData[1];

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

  // --- 1. LOAD VOICES ---
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
  }, []);

  // --- 2. RESET STATE ---
  useEffect(() => {
    setCurrentLessonIndex(0);
    setIsQuizMode(false);
    setShowCompletion(false);
    setHasStarted(false);
    setQuizScore(0);
    setCurrentQuestionIndex(0);
  }, [lectureId]);

  const currentLesson = currentLessonData[currentLessonIndex];
  const totalLessons = currentLessonData.length;
  
  const progressPercent = isQuizMode 
    ? 90 + ((currentQuestionIndex / 5) * 10)
    : ((currentLessonIndex + 1) / totalLessons) * 90;

  // --- 3. PLAY AUDIO ---
  const playAudio = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (voices.length === 0) return;

    window.speechSynthesis.cancel(); 

    // Speak just the text
    const textToSpeak = `${currentLesson.sanskrit} ... ${currentLesson.word}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const hindiVoice = voices.find(v => v.lang === "hi-IN" || v.name.includes("Hindi"));
    const indianVoice = voices.find(v => v.lang.includes("IN"));
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

  // --- 4. AUTO-PLAY ---
  useEffect(() => {
    if (hasStarted && isVoicesLoaded && !showCompletion && !isQuizMode) {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => {
        clearTimeout(timer);
        window.speechSynthesis.cancel();
      };
    }
  }, [currentLessonIndex, hasStarted, isVoicesLoaded, playAudio, showCompletion, isQuizMode]);

  // --- QUIZ LOGIC ---
  const generateQuiz = () => {
    const shuffledData = [...currentLessonData].sort(() => 0.5 - Math.random());
    const selectedItems = shuffledData.slice(0, 5);

    const questions: Question[] = selectedItems.map((item) => {
        const wrongOptions = currentLessonData
            .filter(l => l.id !== item.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(l => l.exampleMeaning);
        
        const options = [...wrongOptions, item.exampleMeaning].sort(() => 0.5 - Math.random());

        return {
            question: `What does "${item.word}" (${item.sanskrit}) mean?`,
            correctAnswer: item.exampleMeaning,
            options: options
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
        completeLesson(currentLectureId, percentage);
    } else {
        setPassed(false);
    }
    setShowCompletion(true);
  };

  // --- NAVIGATION ---
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

  // --- SECURITY CHECK (UI BASED) ---
  const isLocked = !userProgress.unlockedLessons.includes(currentLectureId);

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

  // --- RENDER: START OVERLAY ---
  if (!hasStarted) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-6 overflow-hidden">
        <Card className="max-w-md w-full text-center animate-scale-in bg-card rounded-3xl shadow-elevated border-0">
          <CardContent className="p-10">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
                {isVoicesLoaded ? <Volume2 className="w-10 h-10 text-accent" /> : <Loader2 className="w-10 h-10 text-accent animate-spin"/>}
              </div>
            </div>
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

  // --- RENDER: QUIZ MODE ---
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

  // --- RENDER: COMPLETION SCREEN ---
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
                {passed && courseData[currentLectureId + 1] && (
                    <Button variant="default" className="w-full" onClick={() => {
                        navigate(`/lectures/${currentLectureId + 1}`);
                    }}>
                        Start Next Lesson <ArrowRight className="ml-2 w-4 h-4"/>
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

  // Font sizing helper
  const getFontSizeClass = () => {
    if (currentLectureId <= 3) return "text-9xl";
    if (currentLectureId === 4) return "text-6xl md:text-7xl";
    return "text-4xl md:text-5xl leading-tight";
  };

  // --- RENDER: LESSON SLIDES (WITH ANIMATED MOUTH) ---
  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="flex-none bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/lectures">
              <Button variant="ghost" size="icon"><X className="w-5 h-5" /></Button>
            </Link>
            <span className="text-sm font-semibold text-muted-foreground">
              Lecture {currentLectureId} • Slide {currentLessonIndex + 1} of {totalLessons}
            </span>
            <div className="w-10" /> 
          </div>
          <Progress value={progressPercent} variant="accent" size="sm" />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col justify-center p-4 overflow-hidden">
        <div className="w-full max-w-5xl h-full max-h-[600px] grid grid-cols-1 lg:grid-cols-2 gap-6 mx-auto">
            
            {/* Visual Section - NOW WITH ANIMATED MOUTH */}
            <Card variant="elevated" className="h-full overflow-hidden flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center relative p-6">
                
                {/* LARGE MOUTH AREA - Replaces Teacher Image */}
                <div className="h-64 w-full mb-4 flex justify-center items-center">
                    <div className="w-64 h-64 bg-card/50 rounded-full shadow-inner p-4 border-4 border-primary/20"> 
                        <AnimatedMouth 
                            isSpeaking={isPlaying} 
                            text={currentLesson.sanskrit + " " + currentLesson.word} 
                        />
                    </div>
                </div>

                <h1 className={`${getFontSizeClass()} font-display font-bold text-primary animate-scale-in text-center`}>
                    {currentLesson.sanskrit}
                </h1>
                {currentLectureId <= 3 && (
                  <p className="text-2xl text-foreground/60 mt-4 font-semibold animate-fade-in">
                      {currentLesson.word}
                  </p>
                )}
                {currentLectureId > 3 && (
                   <p className="text-lg text-muted-foreground mt-2">{currentLesson.transliteration}</p>
                )}
              </div>
            </Card>
            
            {/* Meaning & Audio Section */}
            <div className="h-full flex flex-col gap-6">
              <Card variant="elevated" className="flex-1 flex flex-col justify-center text-center">
                <CardContent className="p-8">
                  <div className="text-4xl text-foreground font-semibold mb-2">
                    {currentLesson.transliteration}
                  </div>
                  <p className="text-lg text-muted-foreground">{currentLesson.meaning}</p>
                </CardContent>
              </Card>

              <Card variant="default" className="flex-none">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">Example / Usage:</h4>
                  <p className="text-xl text-primary font-bold">{currentLesson.word}</p>
                  <p className="text-lg text-muted-foreground">{currentLesson.exampleMeaning}</p>
                </CardContent>
              </Card>
              
              <div className="flex-none flex gap-4">
                <Button 
                  variant={isPlaying ? "default" : "default"} 
                  size="lg" 
                  className={`flex-1 transition-all py-6 text-lg ${isPlaying ? "opacity-80" : ""}`}
                  onClick={() => playAudio()}
                  disabled={isPlaying}
                >
                  <Volume2 className={`w-6 h-6 mr-2 ${isPlaying ? "animate-pulse" : ""}`} /> 
                  {isPlaying ? "Playing..." : "Listen Again"}
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="px-6"
                  onClick={() => playAudio()}
                  disabled={isPlaying}
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
