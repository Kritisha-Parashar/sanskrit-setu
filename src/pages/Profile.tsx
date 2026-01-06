import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Trophy, BookOpen, Zap, Star, Calendar, Target, Award } from "lucide-react";
import mascotHappy from "@/assets/mascot-happy.png";
import { useUserProgress } from "@/context/UserProgressContext"; 

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

const StatsOverview = ({ xp, streak, lessons }: { xp: number, streak: number, lessons: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: "Day Streak", value: streak, icon: Flame, color: "text-accent", bg: "bg-accent/10" },
      { label: "Total XP", value: xp, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
      { label: "Lessons Done", value: lessons, icon: BookOpen, color: "text-success", bg: "bg-success/10" },
      { label: "Badges", value: Math.floor(xp / 300), icon: Trophy, color: "text-purple", bg: "bg-purple/10" },
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

const LevelProgress = ({ level, xpProgress }: { level: number, xpProgress: number }) => (
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
            <p className="text-sm text-muted-foreground">{xpProgress} / 100 XP</p>
          </div>
          <span className="text-sm font-semibold text-primary">{xpProgress}%</span>
        </div>
        <Progress value={xpProgress} className="h-3" />
      </div>
    </CardContent>
  </Card>
);

const AchievementsList = ({ xp, lessons, streak }: { xp: number, lessons: number, streak: number }) => {
  // Logic to determine if unlocked based on real data
  const achievements = [
    { name: "First Step", description: "Complete 1 Lesson", icon: Star, earned: lessons >= 1 },
    { name: "Scholar", description: "Earn 300 XP", icon: BookOpen, earned: xp >= 300 },
    { name: "Master", description: "Complete 5 Lessons", icon: Trophy, earned: lessons >= 5 },
    { name: "On Fire", description: "3 Day Streak", icon: Flame, earned: streak >= 3 },
    { name: "Dedication", description: "Earn 1000 XP", icon: Award, earned: xp >= 1000 },
    { name: "Legend", description: "Complete all levels", icon: Zap, earned: lessons >= 20 },
  ];
  
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

// --- MAIN PAGE COMPONENT ---

const Profile = () => {
  const { progress } = useUserProgress(); // Get Real Data from Context

  // Calculate stats dynamically
  const currentLevel = Math.floor(progress.xp / 100) + 1;
  const currentLevelProgress = progress.xp % 100;
  const lessonsCompleted = progress.completedLessons.length;
  const userTitle = progress.xp > 500 ? "Scholar" : "Beginner";
  const streak = 1; // You can add streak logic to context later

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
          <h1 className="font-display text-xl font-bold text-foreground">Your Profile</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProfileHeader level={currentLevel} title={userTitle} />
          <StatsOverview xp={progress.xp} streak={streak} lessons={lessonsCompleted} />
          <LevelProgress level={currentLevel} xpProgress={currentLevelProgress} />
          <AchievementsList xp={progress.xp} lessons={lessonsCompleted} streak={streak} />
        </div>
      </main>
    </div>
  );
};

export default Profile;