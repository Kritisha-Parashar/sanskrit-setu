import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, Trophy, BookOpen, Star, ChevronRight, Settings, 
  User, Zap, Crown, Lock, Sparkles, Gamepad2, GraduationCap,
  MessagesSquare 
} from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { useUserProgress } from "@/context/UserProgressContext";
import { getStoredUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ManuscriptScroll from "@/components/ManuscriptScroll";

const DashboardNavbar = () => {
  const { progress } = useUserProgress();
  const navigate = useNavigate();

  return (
    <nav className="bg-primary-dark sticky top-0 z-[60] shadow-lg">
      <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold text-primary-foreground">Sanskrit-Setu</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 bg-primary/30 rounded-2xl px-4 py-2">
            <button
              onClick={() => navigate("/game")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 border border-white/10"
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">Start Game!</span>
            </button>

            <div className="flex items-center gap-2 text-accent">
              <Flame className="w-5 h-5 fill-current" />
              <span className="font-bold text-primary-foreground">1</span>
            </div>
            <div className="w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2 text-golden">
              <Zap className="w-5 h-5 fill-current" />
              <span className="font-bold text-primary-foreground">{progress.xp}</span>
            </div>
            <div className="w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2 text-purple">
              <Crown className="w-5 h-5 fill-current" />
              <span className="font-bold text-primary-foreground">1</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/30 rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/30 rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const { progress, isLoggedIn } = useUserProgress();
  const user = getStoredUser();
  const displayName = isLoggedIn && user ? (user.username || user.name || "Learner") : "Learner";
  const [showIntro, setShowIntro] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const dynamicBadges = Math.floor(progress.completedLessons.length / 2) + 1;

  useEffect(() => {
    // Force reset scroll on mount to prevent browser-cached scroll overlap
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (!hasSeenIntro) {
      setShowIntro(true);
      sessionStorage.setItem("hasSeenIntro", "true");
      const timer = setTimeout(() => setShowIntro(false), 7200);
      return () => clearTimeout(timer);
    }
  }, []);

  const lessons = [
    { id: 1, lessonId: "LS001", title: "Vowels (Swar)", subtitle: "The 13 Vowels" },
    { id: 2, lessonId: "LS002", title: "Consonants I", subtitle: "Ka to Na" },
    { id: 3, lessonId: "LS003", title: "Consonants II", subtitle: "Pa to Gya" },
    { id: 4, lessonId: "LS004", title: "Vocabulary", subtitle: "Basic Words" },
    { id: 5, lessonId: "LS005", title: "Sentences", subtitle: "Common Phrases" },
  ];

  const performanceCards = [
    { id: 'energy', label: 'Energy', value: progress.xp, icon: Zap, color: 'text-golden' },
    { id: 'badges', label: 'Badges', value: dynamicBadges, icon: Trophy, color: 'text-purple' },
    { id: 'lessons', label: 'Lessons', value: progress.completedLessons.length, icon: GraduationCap, color: 'text-primary' },
    { id: 'level', label: 'Level', value: Math.floor(progress.xp / 500) + 1, icon: Crown, color: 'text-accent' },
  ];

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % (performanceCards.length / 2));
  const handlePrev = () => setCurrentSlide((prev) => (prev === 0 ? (performanceCards.length / 2) - 1 : prev - 1));

  return (
    <div className="relative min-h-screen w-full bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background overflow-x-hidden">
      <DashboardNavbar />

      <main className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="grid grid-cols-12 gap-10">
          
          <aside className="col-span-12 lg:col-span-3 sticky top-24 self-start h-fit space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-xl group/hub relative overflow-hidden">
               <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center opacity-60">Performance Hub</h4>
               
               <div className="relative mb-8 px-2">
                 <button onClick={handlePrev} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white shadow-md border border-black/5 opacity-0 group-hover/hub:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                   <ChevronRight className="w-4 h-4 rotate-180" />
                 </button>
                 <button onClick={handleNext} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white shadow-md border border-black/5 opacity-0 group-hover/hub:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                   <ChevronRight className="w-4 h-4" />
                 </button>

                 <div className="overflow-hidden">
                   <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                     {[0, 2].map((startIndex) => (
                       <div key={startIndex} className="min-w-full grid grid-cols-2 gap-4">
                         {performanceCards.slice(startIndex, startIndex + 2).map((card) => (
                           <div key={card.id} className="bg-primary/5 p-4 rounded-2xl text-center border border-primary/10 transition-transform hover:scale-105">
                             <card.icon className={`w-5 h-5 ${card.color} mx-auto mb-1 fill-current`} />
                             <p className="text-2xl font-black text-foreground">{card.value}</p>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">{card.label}</p>
                           </div>
                         ))}
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-black/[0.05]">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-bold text-foreground">Course Mastery</p>
                      <p className="text-xs font-black text-primary">{Math.round((progress.completedLessons.length / 5) * 100)}%</p>
                    </div>
                    <Progress value={(progress.completedLessons.length / 5) * 100} className="h-2.5 bg-muted rounded-full overflow-hidden" />
                  </div>

                  <Link to="/lectures" className="block group">
                    <div className="bg-primary hover:bg-primary-dark p-5 rounded-2xl text-white transition-all shadow-lg active:scale-95 flex items-center gap-4">
                       <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                       </div>
                       <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-widest opacity-70 leading-none mb-1">Explore Library</p>
                          <p className="text-sm font-bold">Lecture List</p>
                       </div>
                       <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
               </div>
            </div>
          </aside>

          <section className="col-span-12 lg:col-span-6 space-y-8 pb-20">
            <div className="bg-white/90 backdrop-blur-md rounded-[3rem] p-10 border border-white/50 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
               <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="bg-muted/50 p-2 rounded-full border border-black/[0.02] shadow-inner">
                    <InteractiveMascot mood="happy" size="lg" showHeart />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-display font-bold text-foreground mb-2">नमस्कारम्, {displayName}! 🙏</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                      Your persistence is the key to mastering Sanskrit. Ready to continue your path?
                    </p>
                  </div>
               </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-12 border border-white/40 shadow-inner">
               <div className="flex items-center justify-center gap-4 mb-16">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.4em]">Syllabus Path</h3>
               </div>

               <div className="relative flex flex-col items-center gap-16">
                  <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-muted/40 rounded-full -translate-x-1/2 shadow-inner" />
                  
                  {lessons.map((lesson) => {
                    const isUnlocked = progress.unlockedLessons.includes(lesson.lessonId);
                    const isCompleted = progress.completedLessons.includes(lesson.lessonId);
                    const isCurrent = isUnlocked && !isCompleted;

                    return (
                      <Link key={lesson.id} to={isUnlocked ? `/lectures/${lesson.lessonId}` : "#"} className={`relative group ${!isUnlocked ? 'opacity-30' : ''}`}>
                        <div className={`
                          w-20 h-20 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 shadow-2xl z-10 relative border-2
                          ${isCompleted ? 'bg-success border-success/10 text-white shadow-success/20' : isCurrent ? 'bg-accent border-accent/20 text-white ring-[15px] ring-accent/10 scale-110 shadow-accent/20' : 'bg-white border-muted-foreground/10 text-muted-foreground'}
                          ${isUnlocked && 'hover:scale-110 group-hover:rotate-6'}
                        `}>
                          {isCompleted ? <Star className="w-8 h-8 fill-current" /> : !isUnlocked ? <Lock className="w-6 h-6" /> : <span className="text-2xl font-display">{lesson.id}</span>}
                        </div>
                        
                        <div className={`absolute left-full ml-10 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-black/[0.04] shadow-2xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 min-w-[220px]
                          ${isCurrent ? 'opacity-100 translate-x-0 border-l-4 border-l-accent' : ''}
                        `}>
                           <p className="font-bold text-foreground text-lg">{lesson.title}</p>
                           <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">{lesson.subtitle}</p>
                        </div>
                      </Link>
                    )
                  })}
               </div>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-3 sticky top-24 self-start h-fit space-y-6">
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-purple/40 to-primary/40 rounded-[2.5rem] blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
               <Link to="/ai-scholar" className="relative block bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 border border-purple/20 shadow-xl overflow-hidden transition-transform hover:-translate-y-1">
                 <div className="absolute top-0 right-0 p-4">
                   <Star className="w-6 h-6 text-purple animate-pulse" />
                 </div>
                 <div className="w-12 h-12 bg-purple/10 rounded-2xl flex items-center justify-center mb-6 border border-purple/10">
                   <Sparkles className="w-6 h-6 text-purple" />
                 </div>
                 <h4 className="font-display text-2xl font-bold text-foreground mb-2 leading-none">AI Scholar</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                   Analyze any Sanskrit shloka with deep grammar insight instantly.
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-purple bg-purple/5 w-fit px-4 py-2 rounded-full border border-purple/10">
                   Analyze Now <ChevronRight className="w-3 h-3" />
                 </div>
               </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 border border-white/50 shadow-lg space-y-4">
               <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 px-2">Laboratory</h4>
               
               <Link to="/test-session" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all group">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">🧪</div>
                  <div className="flex-1">
                     <p className="text-sm font-bold">Voice Test</p>
                     <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">AI Validation</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
               </Link>

               <Link to="/gurukul-lesson" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all group border-t border-black/5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <MessagesSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold">Conversations</p>
                     <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Interactive Lab</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </aside>
        </div>
      </main>

      {showIntro && <ManuscriptScroll />}
    </div>
  );
};

export default Dashboard;