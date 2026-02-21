import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, Trophy, BookOpen, Star, ChevronRight, Settings, 
  Zap, Crown, GraduationCap, Calendar, Mail, 
  Edit3, Share2, Award, History, TrendingUp, ArrowLeft, Lock, LogOut
} from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { useUserProgress } from "@/context/UserProgressContext";
import { getStoredUser } from "@/lib/auth"; // Removed logoutUser from here
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  // Removed refreshProgress as it's not defined in your context
  const { progress, isLoggedIn } = useUserProgress();
  // Inside Profile.tsx
const { logoutUser } = useUserProgress(); // Use your context function
  const navigate = useNavigate();
  const user = getStoredUser();
  
  const displayName = isLoggedIn && user ? (user.username || user.name || "Scholar") : "Scholar";
  const userEmail = user?.email || "Sanskrit Learner";
  
  const dynamicBadges = Math.floor(progress.completedLessons.length / 2) + 1;
  const masteryPercentage = Math.round((progress.completedLessons.length / 5) * 100);
  const userLevel = Math.floor(progress.xp / 500) + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    // Standard logout logic: clear storage and redirect
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    window.location.href = "/login"; // Force reload to clear context state
    logoutUser(); // This now handles the state reset and storage clearing
    navigate("/"); // Redirect to landing page
  };

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <nav className="bg-primary-dark sticky top-0 z-[60] shadow-lg">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-primary-foreground group-hover:-translate-x-1 transition-transform" />
            <span className="font-display text-2xl font-bold text-primary-foreground">Back to Learning</span>
          </Link>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 text-golden bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                <Zap className="w-4 h-4 fill-current" />
                <span className="font-bold text-primary-foreground text-sm">{progress.xp} XP</span>
             </div>
             <Link to="/settings">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/30 rounded-full">
                  <Settings className="w-5 h-5" />
                </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="grid grid-cols-12 gap-10">
          
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-[3rem] p-8 border border-white/50 shadow-xl text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 to-purple/20 opacity-30" />
              
              <div className="relative z-10">
                <div className="w-32 h-32 mx-auto bg-white rounded-full p-2 shadow-2xl border-4 border-primary/10 mb-6 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full rounded-full bg-muted/30 flex items-center justify-center overflow-hidden">
                    <InteractiveMascot mood="happy" size="lg" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-display font-bold text-foreground mb-1">{displayName}</h2>
                <p className="text-sm font-medium text-muted-foreground mb-6 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 opacity-50" /> {userEmail}
                </p>

                <div className="flex flex-col gap-3 mb-8">
                  <Button className="w-full rounded-2xl h-12 bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full rounded-2xl h-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 py-6 border-t border-black/[0.05]">
                  <div>
                    <p className="text-xl font-black text-foreground">{progress.xp}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">XP Points</p>
                  </div>
                  <div className="border-x border-black/[0.05]">
                    <p className="text-xl font-black text-foreground">{dynamicBadges}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Badges</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-foreground">{userLevel}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Level</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-lg">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 opacity-60">Backend Records</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Course Track</p>
                    <p className="text-sm font-bold text-foreground">Sanskrit-Setu Alpha</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple/5 border border-purple/5">
                  <div className="w-10 h-10 bg-purple/10 rounded-xl flex items-center justify-center text-purple">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Milestone</p>
                    <p className="text-sm font-bold text-foreground">Vaidika Beginner</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-8 space-y-8 pb-20">
            <div className="bg-white/90 backdrop-blur-md rounded-[3rem] p-10 border border-white/50 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
               
               <h3 className="text-2xl font-display font-bold text-foreground mb-8 flex items-center gap-3 relative z-10">
                 <TrendingUp className="w-6 h-6 text-primary" /> Learning Momentum
               </h3>
              
              <div className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold text-foreground">Curriculum Mastered</p>
                      <p className="text-xs font-medium text-muted-foreground">Backend synced: {progress.completedLessons.length} Modules</p>
                    </div>
                    <span className="text-3xl font-black text-primary">{masteryPercentage}%</span>
                  </div>
                  <Progress value={masteryPercentage} className="h-4 bg-muted rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 flex items-center gap-6 transition-all hover:shadow-lg hover:shadow-accent/5">
                    <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center text-white shadow-xl shadow-accent/20">
                      <Flame className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-foreground">1 Day</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Streak</p>
                    </div>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-golden/5 border border-golden/10 flex items-center gap-6 transition-all hover:shadow-lg hover:shadow-golden/5">
                    <div className="w-16 h-16 bg-golden rounded-3xl flex items-center justify-center text-white shadow-xl shadow-golden/20">
                      <Star className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-foreground">{progress.xp}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-10 border border-white/40 shadow-inner">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-10 text-center">Acharya Honors</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {[
                  { name: "First Steps", icon: Star, color: "text-golden", check: true },
                  { name: "Vowel Pro", icon: Zap, color: "text-accent", check: progress.completedLessons.includes("LS001") },
                  { name: "Word Weaver", icon: Crown, color: "text-purple", check: progress.completedLessons.includes("LS004") },
                  { name: "Grammarian", icon: Award, color: "text-primary", check: progress.completedLessons.length >= 5 },
                ].map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center group">
                    <div className={`w-24 h-24 rounded-[2.2rem] mb-4 flex items-center justify-center transition-all duration-500 shadow-2xl bg-white border-2 
                      ${badge.check ? 'border-primary/20 group-hover:rotate-12 group-hover:scale-110' : 'opacity-20 grayscale border-dashed border-muted-foreground/50'}`}>
                      {badge.check ? <badge.icon className={`w-10 h-10 ${badge.color} fill-current`} /> : <Lock className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-tighter text-center ${badge.check ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;