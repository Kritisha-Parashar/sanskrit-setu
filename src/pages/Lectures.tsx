import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock,
  BookOpen
} from "lucide-react";
import { useUserProgress } from "@/context/UserProgressContext";
import { useEffect, useState } from "react";

type Lesson = {
  LessonID: string;
  LessonNumber: number;
  Title_Sanskrit: string;
  Title_English: string;
  Difficulty_Level: string;
  Description: string;
};

const Lectures = () => {
  const { progress } = useUserProgress();
  const [lectures, setLectures] = useState<Lesson[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    
    fetch(`${API_URL}/lessons`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (!data || data.length === 0) {
          setLectures([]);
          return;
        }
        data.sort((a: Lesson, b: Lesson) => a.LessonNumber - b.LessonNumber);
        setLectures(data);
      })
      .catch(err => {
        console.error("Failed to fetch lessons", err);
        setLectures([]);
      });
  }, []);

  const totalLectures = lectures.length;
  const completedCount = lectures.filter(l =>
    progress.completedLessons.includes(l.LessonID)
  ).length;
  const overallProgress = totalLectures === 0 ? 0 : (completedCount / totalLectures) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Lectures
            </h1>
            <p className="text-sm text-muted-foreground">
              Foundation of Sanskrit
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <Card
            variant="elevated"
            className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-none"
          >
            <CardHeader>
              <CardDescription>Level 1 Progress</CardDescription>
              <CardTitle className="text-2xl">
                Foundation of Sanskrit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedCount}/{totalLectures} lectures completed
                  </span>
                  <span className="font-semibold text-primary">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
                <Progress value={overallProgress} variant="accent" size="lg" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {lectures.map((lecture) => {
              const isFirstLesson = lecture.LessonID === 'LS001' || lecture.LessonNumber === 1;
              const isUnlocked = isFirstLesson || progress.unlockedLessons.includes(lecture.LessonID);
              const isCompleted = progress.completedLessons.includes(lecture.LessonID);
              const lectureProgress = isCompleted ? 100 : 0;

              return (
                <Card
                  key={lecture.LessonID}
                  variant={!isUnlocked ? "flat" : "interactive"}
                  className={!isUnlocked ? "opacity-60 bg-muted/50" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-success/10"
                            : !isUnlocked
                            ? "bg-muted"
                            : "bg-primary/10"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-7 h-7 text-success" />
                        ) : !isUnlocked ? (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        ) : (
                          <BookOpen className="w-7 h-7 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-foreground mb-1">
                              Lecture {lecture.LessonNumber}:{" "}
                              {lecture.Title_English} (
                              {lecture.Title_Sanskrit})
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {lecture.Description}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground shrink-0">—</span>
                        </div>

                        {isUnlocked && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {isCompleted ? "Completed" : "Not started"}
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

                        <div className="mt-4">
                          {!isUnlocked ? (
                            <Button variant="secondary" disabled className="w-full md:w-auto">
                              <Lock className="w-4 h-4 mr-2" />
                              Locked
                            </Button>
                          ) : (
                            <Link to={`/lectures/${lecture.LessonID}`}>
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