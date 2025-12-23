import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle2, Lock, BookOpen } from "lucide-react";

// Lectures data structure for scalability
const lecturesData = [
  {
    id: 1,
    title: "Basic Sounds (स्वर)",
    description: "Learn the fundamental vowel sounds: अ, आ, इ, ई, उ, ऊ",
    progress: 100,
    lessonsCount: 6,
    lessonsCompleted: 6,
    status: "completed" as const,
    duration: "15 min",
  },
  {
    id: 2,
    title: "Consonants Part 1 (क वर्ग)",
    description: "Master the first group of consonants: क, ख, ग, घ, ङ",
    progress: 60,
    lessonsCount: 5,
    lessonsCompleted: 3,
    status: "in-progress" as const,
    duration: "20 min",
  },
  {
    id: 3,
    title: "Basic Two-Letter Words",
    description: "Combine sounds to form simple words",
    progress: 0,
    lessonsCount: 8,
    lessonsCompleted: 0,
    status: "locked" as const,
    duration: "25 min",
  },
  {
    id: 4,
    title: "Consonants Part 2 (च वर्ग)",
    description: "Learn the second group: च, छ, ज, झ, ञ",
    progress: 0,
    lessonsCount: 5,
    lessonsCompleted: 0,
    status: "locked" as const,
    duration: "20 min",
  },
  {
    id: 5,
    title: "Simple Sentences",
    description: "Form your first Sanskrit sentences",
    progress: 0,
    lessonsCount: 10,
    lessonsCompleted: 0,
    status: "locked" as const,
    duration: "30 min",
  },
];

const LectureCard = ({ lecture }: { lecture: typeof lecturesData[0] }) => {
  const isLocked = lecture.status === "locked";
  const isCompleted = lecture.status === "completed";
  
  return (
    <Card 
      variant={isLocked ? "flat" : "interactive"} 
      className={isLocked ? "opacity-60" : ""}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            isCompleted 
              ? "bg-success/10" 
              : isLocked 
                ? "bg-muted" 
                : "bg-primary/10"
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7 text-success" />
            ) : isLocked ? (
              <Lock className="w-6 h-6 text-muted-foreground" />
            ) : (
              <BookOpen className="w-7 h-7 text-primary" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">
                  Lecture {lecture.id}: {lecture.title}
                </h3>
                <p className="text-muted-foreground text-sm">{lecture.description}</p>
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{lecture.duration}</span>
            </div>
            
            {/* Progress */}
            {!isLocked && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {lecture.lessonsCompleted}/{lecture.lessonsCount} lessons
                  </span>
                  <span className={`font-semibold ${isCompleted ? "text-success" : "text-primary"}`}>
                    {lecture.progress}%
                  </span>
                </div>
                <Progress 
                  value={lecture.progress} 
                  variant={isCompleted ? "success" : "default"} 
                  size="default" 
                />
              </div>
            )}
            
            {/* Action Button */}
            <div className="mt-4">
              {isLocked ? (
                <Button variant="secondary" disabled className="w-full md:w-auto">
                  <Lock className="w-4 h-4" />
                  Complete Previous Lectures
                </Button>
              ) : (
                <Link to={`/lesson/${lecture.id}/1`}>
                  <Button 
                    variant={isCompleted ? "secondary" : "default"} 
                    className="w-full md:w-auto"
                  >
                    <Play className="w-4 h-4" />
                    {isCompleted ? "Review" : "Continue"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Lectures = () => {
  const totalLectures = lecturesData.length;
  const completedLectures = lecturesData.filter(l => l.status === "completed").length;
  const overallProgress = (completedLectures / totalLectures) * 100;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Level 1 Lectures</h1>
            <p className="text-sm text-muted-foreground">Foundation of Sanskrit</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Overall Progress */}
          <Card variant="elevated" className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-none">
            <CardHeader>
              <CardDescription>Level 1 Progress</CardDescription>
              <CardTitle className="text-2xl">Foundation of Sanskrit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedLectures}/{totalLectures} lectures completed
                  </span>
                  <span className="font-semibold text-primary">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} variant="accent" size="lg" />
              </div>
            </CardContent>
          </Card>
          
          {/* Lectures List */}
          <div className="space-y-4">
            {lecturesData.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lectures;
