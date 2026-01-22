import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Trophy, BookOpen, Zap, Star, Target, Award, LogOut } from "lucide-react";
import mascotHappy from "@/assets/mascot-happy.png";
import { useUserProgress } from "@/context/UserProgressContext"; 
import { logout } from "@/lib/auth"; 

// --- SUB-COMPONENTS ---

const ProfileHeader = ({ level, title }: { level: number, title: string }) => (
  <Card className="overflow-hidden border-0 shadow-card">
    <div className="h-24 bg-gradient-to-r from-primary to-primary-dark" />
    <CardContent className="relative pt-0 pb-6 px-6">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12">
        <div className="w-24 h-24 rounded-full bg-card border-4 border-card flex items-center justify-center shadow-card">
          <img 
            src={mascotHappy} 
            alt="Profile" 
            className="w-20 h-20 object-contain"
          />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="font-display text-2xl font-bold text-foreground">Sanskrit Learner</h2>
          <p className="text-muted-foreground">Level {level} • {title}</p>
        </div>
        <Link to="/dashboard">
          <Button variant="secondary" className="shadow-sm">
            Back to Learning
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

const StatsOverview = ({ xp, streak, lessons, badgesCount }: { xp: number, streak: number, lessons: number, badgesCount: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: "Day Streak", value: streak, icon: Flame, color: "text-accent", bg: "bg-accent/10" },
      { label: "Total XP", value: xp, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
      { label: "Lessons Done", value: lessons, icon: BookOpen, color: "text-success", bg: "bg-success/10" },
      { label: "Badges", value: badgesCount, icon: Trophy, color: "text-purple", bg: "bg-purple/10" },
    ].map((stat, index) => (
      <Card key={index} className="border-0 shadow-card">
        <CardContent className="p-6 text-center">
          <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

const LevelProgress = ({ level, progressPercent, lessonsInLevel }: { level: number, progressPercent: number, lessonsInLevel: number }) => (
  <Card className="border-0 shadow-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Current Level Progress
      </CardTitle>
      <CardDescription>Path to Level {level + 1}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-semibold text-foreground">Level {level}</h4>
            <p className="text-sm text-muted-foreground">{lessonsInLevel} / 5 Lessons</p>
          </div>
          <span className="text-sm font-semibold text-primary">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>
    </CardContent>
  </Card>
);

const AchievementsList = ({ achievements }: { achievements: any[] }) => {
  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Achievements
        </CardTitle>
        <CardDescription>Badges you have unlocked</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border text-center transition-all ${
                achievement.earned 
                  ? "bg-accent/5 border-accent/20" 
                  : "bg-muted/50 border-border opacity-50 grayscale"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                achievement.earned ? "bg-accent/10" : "bg-muted"
              }`}>
                <achievement.icon className={`w-6 h-6 ${
                  achievement.earned ? "text-accent" : "text-muted-foreground"
                }`} />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">{achievement.name}</h4>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const { progress, logoutUser } = useUserProgress();
  const navigate = useNavigate();

  // --- STATS LOGIC ---
  const lessonsCompleted = progress.completedLessons.length;
  const xp = progress.xp;
  
  // Level Logic: 1 Level = 5 Lessons
  // Start at Level 1. If 5 lessons done -> Level 2 (0/5)
  const currentLevel = Math.floor(lessonsCompleted / 5) + 1;
  const lessonsInCurrentLevel = lessonsCompleted % 5;
  const currentLevelProgressPercent = (lessonsInCurrentLevel / 5) * 100;
  
  const userTitle = xp > 500 ? "Scholar" : "Beginner";
  const streak = 1; 

  // Achievement Logic
  const achievements = [
    { name: "First Step", description: "Complete 1 Lesson", icon: Star, earned: lessonsCompleted >= 1 },
    { name: "Scholar", description: "Earn 100 XP", icon: BookOpen, earned: xp >= 100 },
    { name: "Master", description: "Complete 5 Lessons", icon: Trophy, earned: lessonsCompleted >= 5 },
    { name: "On Fire", description: "3 Day Streak", icon: Flame, earned: streak >= 3 },
    { name: "Dedication", description: "Earn 500 XP", icon: Award, earned: xp >= 500 },
    { name: "Legend", description: "Complete 20 Lessons", icon: Zap, earned: lessonsCompleted >= 20 },
  ];

  const earnedBadgesCount = achievements.filter(a => a.earned).length;

  const handleLogout = async () => {
    try {
      await logout(); 
      logoutUser();   
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Your Profile</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProfileHeader level={currentLevel} title={userTitle} />
          
          <StatsOverview 
            xp={xp} 
            streak={streak} 
            lessons={lessonsCompleted} 
            badgesCount={earnedBadgesCount} 
          />
          
          <LevelProgress 
            level={currentLevel} 
            progressPercent={currentLevelProgressPercent}
            lessonsInLevel={lessonsInCurrentLevel}
          />
          
          <AchievementsList achievements={achievements} />
          
          {/* LOGOUT BUTTON */}
          <div className="flex justify-center pt-8 pb-12">
            <Button variant="destructive" onClick={handleLogout} className="gap-2 px-8 rounded-xl h-12 text-lg">
              <LogOut className="w-5 h-5" /> Log Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;