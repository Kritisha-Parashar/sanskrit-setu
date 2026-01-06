import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Volume2, RotateCcw, X, CheckCircle2 } from "lucide-react";
import teacher from "@/assets/teacher.png";
import InteractiveMascot from "@/components/InteractiveMascot";
// Lessons data for Lecture 2 (in-progress lecture)
const lessonsData = [
  {
    id: 1,
    sanskrit: "क",
    transliteration: "ka",
    meaning: "The sound 'ka' - first consonant",
    example: "कमल (kamal) - lotus",
    audioPlaceholder: true,
  },
  {
    id: 2,
    sanskrit: "ख",
    transliteration: "kha",
    meaning: "The sound 'kha' - aspirated 'ka'",
    example: "खग (khaga) - bird",
    audioPlaceholder: true,
  },
  {
    id: 3,
    sanskrit: "ग",
    transliteration: "ga",
    meaning: "The sound 'ga' - soft guttural",
    example: "गज (gaja) - elephant",
    audioPlaceholder: true,
  },
  {
    id: 4,
    sanskrit: "घ",
    transliteration: "gha",
    meaning: "The sound 'gha' - aspirated 'ga'",
    example: "घन (ghana) - dense/cloud",
    audioPlaceholder: true,
  },
  {
    id: 5,
    sanskrit: "ङ",
    transliteration: "ṅa",
    meaning: "The nasal sound 'ṅa'",
    example: "Used in words like अङ्क (anka)",
    audioPlaceholder: true,
  },
];

const LessonPlayer = () => {
  const { lectureId, lessonId } = useParams();
  const navigate = useNavigate();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(
    parseInt(lessonId || "1") - 1
  );
  const [showCompletion, setShowCompletion] = useState(false);

  
  const currentLesson = lessonsData[currentLessonIndex];
  const totalLessons = lessonsData.length;
  const progress = ((currentLessonIndex + 1) / totalLessons) * 100;
  
  const handleNext = () => {
    if (currentLessonIndex < totalLessons - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else {
      setShowCompletion(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };
  
  const handlePlayPronunciation = () => {
    // Placeholder for pronunciation playback
    console.log("Playing pronunciation for:", currentLesson.sanskrit);
  };
  
  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center animate-scale-in bg-card rounded-3xl shadow-elevated border-0">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <InteractiveMascot mood="celebrate" size="xl" messages={["You did it! 🎉", "Amazing! ⭐", "Keep going! 🚀"]} />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              🎉 Lecture Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              You've mastered the क वर्ग consonants! Keep up the amazing work.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">+50 XP</span>
              </div>
            </div>
            <div className="space-y-3">
              <Link to="/lectures" className="block">
                <Button variant="default" className="w-full">
                  Continue to Next Lecture
                </Button>
              </Link>
              <Link to="/dashboard" className="block">
                <Button variant="secondary" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/lectures">
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </Link>
            <span className="text-sm font-semibold text-muted-foreground">
              Lesson {currentLessonIndex + 1} of {totalLessons}
            </span>
            <div className="w-10" /> {/* Spacer */}
          </div>
          <Progress value={progress} variant="accent" size="sm" />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Teacher Video Section */}
            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                <img 
                  src={teacher} 
                  alt="Sanskrit teacher" 
                  className="h-48 object-contain"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Video pronunciation coming soon
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Lesson Content */}
            <div className="space-y-6">
              {/* Sanskrit Character */}
              <Card variant="elevated" className="text-center">
                <CardContent className="p-8">
                  <div className="text-9xl font-bold text-primary mb-4 font-display">
                    {currentLesson.sanskrit}
                  </div>
                  <div className="text-3xl text-foreground font-semibold mb-2">
                    {currentLesson.transliteration}
                  </div>
                  <p className="text-muted-foreground">
                    {currentLesson.meaning}
                  </p>
                </CardContent>
              </Card>
              
              {/* Example */}
              <Card variant="default">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">Example:</h4>
                  <p className="text-lg text-muted-foreground">{currentLesson.example}</p>
                </CardContent>
              </Card>
              
              {/* Audio Controls */}
              <div className="flex gap-4">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="flex-1"
                  onClick={handlePlayPronunciation}
                >
                  <Volume2 className="w-5 h-5" />
                  Listen to Pronunciation
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={handlePlayPronunciation}
                >
                  <RotateCcw className="w-5 h-5" />
                  Repeat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer Navigation */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button 
              variant="secondary" 
              onClick={handlePrevious}
              disabled={currentLessonIndex === 0}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </Button>
            
            {/* Mascot encouragement */}
            <div className="hidden md:flex items-center gap-3">
              <InteractiveMascot mood="happy" size="sm" messages={["Great job! 🌟", "Keep it up! 💪"]} />
              <span className="text-sm text-muted-foreground">
                You're doing great! 🌟
              </span>
            </div>
            
            <Button 
              variant="accent" 
              onClick={handleNext}
            >
              {currentLessonIndex === totalLessons - 1 ? "Complete" : "Next"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default LessonPlayer;
