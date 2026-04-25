import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  Trophy, 
  Star, 
  ChevronRight,
  Sparkles
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
    // --- FORCE SCROLL TO TOP ON LOAD ---
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

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
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      {/* --- ELITE HEADER (RIGHT TEXT REMOVED) --- */}
      <header className="bg-primary-dark sticky top-0 z-[60] shadow-lg">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center">
          <div className="flex items-center gap-6">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/30 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <span className="font-display text-2xl font-bold text-primary-foreground tracking-tight">Sanskrit-Setu</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-10">
          
          {/* LEFT SIDEBAR: COMPACT STATIC OVERVIEW  */}
          <aside className="col-span-12 lg:col-span-4 sticky top-24 self-start h-fit space-y-4">
            {/* Progress Card (Condensed Height) */}
            <Card className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 border border-white/50 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <BookOpen className="w-16 h-16 text-primary" />
               </div>
               
               <div className="relative z-10">
                 <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Curriculum Status</h4>
                 <h2 className="text-xl font-display font-bold text-foreground mb-4">Foundation Level</h2>
                 
                 <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-xl border border-black/[0.01]">
                       <div className="flex justify-between items-end mb-2">
                          <p className="text-xs font-bold text-foreground">Completion</p>
                          <p className="text-lg font-black text-primary">{Math.round(overallProgress)}%</p>
                       </div>
                       <Progress value={overallProgress} className="h-2 bg-muted rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-success/5 border border-success/10 p-3 rounded-xl text-center">
                          <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1" />
                          <p className="text-md font-black text-foreground">{completedCount}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">Done</p>
                       </div>
                       <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl text-center">
                          <Trophy className="w-4 h-4 text-accent mx-auto mb-1" />
                          <p className="text-md font-black text-foreground">{totalLectures - completedCount}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">To Go</p>
                       </div>
                    </div>
                 </div>
               </div>
            </Card>

            {/* Voice Lab Card */}
            <div className="bg-primary p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
               <Sparkles className="absolute -bottom-4 -right-4 w-20 h-20 opacity-10" />
               <h4 className="text-md font-bold mb-1">Voice Lab</h4>
               <p className="text-[11px] opacity-80 mb-4 leading-relaxed">Test your pronunciation and gain bonus XP instantly.</p>
               <Link to="/test-session">
                  <Button className="w-full bg-white text-primary hover:bg-accent hover:text-white font-black rounded-lg py-5 text-xs transition-all active:scale-95">
                    START TESTING
                  </Button>
               </Link>
            </div>
          </aside>
          <section className="col-span-12 lg:col-span-8 space-y-4">
            <div className="flex items-center gap-4 mb-4 px-2">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Available Modules</span>
               <div className="h-px flex-1 bg-muted-foreground/20" />
            </div>

            <div className="space-y-4">
              {lectures.map((lecture) => {
                const isFirstLesson = lecture.LessonID === 'LS001' || lecture.LessonNumber === 1;
                const isUnlocked = isFirstLesson || progress.unlockedLessons.includes(lecture.LessonID);
                const isCompleted = progress.completedLessons.includes(lecture.LessonID);

                return (
                  <Card
                    key={lecture.LessonID}
                    className={`group transition-all duration-500 rounded-[1.8rem] border border-black/[0.02] shadow-sm hover:shadow-xl overflow-hidden
                      ${!isUnlocked ? "opacity-50 grayscale bg-muted/20" : "bg-white/80 backdrop-blur-sm"}
                    `}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-stretch min-h-[120px]">
                        
                        <div className={`w-1.5 shrink-0 transition-all ${isCompleted ? 'bg-success' : isUnlocked ? 'bg-primary group-hover:w-3' : 'bg-muted'}`} />
                        
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center gap-6">
                           
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border
                             ${isCompleted ? "bg-success/5 border-success/20 text-success" : !isUnlocked ? "bg-muted border-transparent text-muted-foreground" : "bg-primary/5 border-primary/20 text-primary"}
                           `}>
                              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : !isUnlocked ? <Lock className="w-5 h-5" /> : <BookOpen className="w-6 h-6" />}
                           </div>

                           
                           <div className="flex-1 text-center md:text-left min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Module {lecture.LessonNumber}</span>
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${lecture.Difficulty_Level === 'Beginner' ? 'text-success' : 'text-accent'}`}>
                                    • {lecture.Difficulty_Level}
                                 </span>
                              </div>
                              <h3 className="text-lg font-bold text-foreground leading-tight">
                                {lecture.Title_English} <span className="font-display font-medium text-muted-foreground ml-1 text-sm">({lecture.Title_Sanskrit})</span>
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1 font-medium">
                                {lecture.Description}
                              </p>
                           </div>

                           
                           <div className="shrink-0 w-full md:w-auto">
                              {!isUnlocked ? (
                                <div className="px-6 py-2 bg-muted/50 rounded-lg text-[10px] font-black text-muted-foreground flex items-center gap-2 border border-black/5">
                                  <Lock className="w-3 h-3" /> LOCKED
                                </div>
                              ) : (
                                <Link to={`/lectures/${lecture.LessonID}`}>
                                  <Button
                                    variant={isCompleted ? "secondary" : "default"}
                                    className={`w-full rounded-xl px-8 py-5 font-bold shadow-md transition-all active:scale-95 text-xs
                                      ${isCompleted ? "hover:bg-muted" : "bg-primary hover:bg-primary-dark shadow-primary/10"}
                                    `}
                                  >
                                    {isCompleted ? "REVIEW" : "START MODULE"}
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
            
            <div className="h-20" />
          </section>

        </div>
      </main>
    </div>
  );
};

export default Lectures;