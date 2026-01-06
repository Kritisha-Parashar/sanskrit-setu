import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle2, Lock, BookOpen } from "lucide-react";
import { useUserProgress } from "@/context/UserProgressContext"; 

// --- STATIC DATA (Metadata only) ---
const lecturesMetadata = [
  { 
    id: 1, 
    title: "Basic Sounds (स्वर)", 
    description: "Learn the fundamental vowel sounds: अ, आ, इ, ई, उ, ऊ", 
    duration: "15 min",
    lessonsCount: 6
  },
  { 
    id: 2, 
    title: "Consonants Part 1 (क वर्ग)", 
    description: "Master the first group of consonants: क, ख, ग, घ, ङ", 
    duration: "20 min",
    lessonsCount: 5
  },
  { 
    id: 3, 
    title: "Consonants Part 2 (च वर्ग)", 
    description: "Learn the second group: च, छ, ज, झ, ञ", 
    duration: "25 min",
    lessonsCount: 8
  },
  { 
    id: 4, 
    title: "Two-Letter Words", 
    description: "Combine sounds to form simple words", 
    duration: "20 min",
    lessonsCount: 5
  },
  { 
    id: 5, 
    title: "Simple Sentences", 
    description: "Form your first Sanskrit sentences", 
    duration: "30 min",
    lessonsCount: 10
  },
];

const Lectures = () => {
  const { progress } = useUserProgress(); 

  // Calculate Overall Statistics
  const totalLectures = lecturesMetadata.length;
  // A lecture is "Completed" if its ID is in the completed list
  const completedCount = lecturesMetadata.filter(l => progress.completedLessons.includes(l.id)).length;
  const overallProgress = (completedCount / totalLectures) * 100;

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
          
          {/* Overall Progress Card */}
          <Card variant="elevated" className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-none">
            <CardHeader>
              <CardDescription>Level 1 Progress</CardDescription>
              <CardTitle className="text-2xl">Foundation of Sanskrit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedCount}/{totalLectures} lectures completed
                  </span>
                  <span className="font-semibold text-primary">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} variant="accent" size="lg" />
              </div>
            </CardContent>
          </Card>

          {/* Lectures List */}
          <div className="space-y-4">
            {lecturesMetadata.map((lecture) => {
              // DYNAMIC STATE
              const isUnlocked = progress.unlockedLessons.includes(lecture.id);
              const isCompleted = progress.completedLessons.includes(lecture.id);
              const lectureProgress = isCompleted ? 100 : 0; // Simple binary progress for now

              return (
                <Card 
                  key={lecture.id}
                  variant={!isUnlocked ? "flat" : "interactive"} 
                  className={!isUnlocked ? "opacity-60 bg-muted/50" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCompleted 
                          ? "bg-success/10" 
                          : !isUnlocked 
                            ? "bg-muted" 
                            : "bg-primary/10"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-7 h-7 text-success" />
                        ) : !isUnlocked ? (
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
                        
                        {/* Progress Bar (Per Lecture) */}
                        {!(!isUnlocked) && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {isCompleted ? lecture.lessonsCount : 0}/{lecture.lessonsCount} lessons
                              </span>
                              <span className={`font-semibold ${isCompleted ? "text-success" : "text-primary"}`}>
                                {lectureProgress}%
                              </span>
                            </div>
                            <Progress 
                              value={lectureProgress} 
                              variant={isCompleted ? "success" : "default"} 
                              size="default" 
                            />
                          </div>
                        )}
                        
                        {/* Action Button */}
                        <div className="mt-4">
                          {!isUnlocked ? (
                            <Button variant="secondary" disabled className="w-full md:w-auto">
                              <Lock className="w-4 h-4 mr-2" />
                              Locked
                            </Button>
                          ) : (
                            <Link to={`/lectures/${lecture.id}`}>
                              <Button 
                                variant={isCompleted ? "secondary" : "default"} 
                                className="w-full md:w-auto"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {isCompleted ? "Review" : "Start"}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lectures;