import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Trophy, BookOpen, Zap, Star, Calendar, Target, Award } from "lucide-react";
import mascotHappy from "@/assets/mascot-happy.png";

const ProfileHeader = () => (
  <Card variant="elevated" className="overflow-hidden">
    <div className="h-24 bg-gradient-to-r from-primary to-primary-dark" />
    <CardContent className="relative pt-0 pb-6 px-6">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12">
        <div className="w-24 h-24 rounded-full bg-card border-4 border-card flex items-center justify-center shadow-card">
          <img 
            src={mascotHappy} 
            alt="Profile" 
            className="w-20 h-20"
          />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="font-display text-2xl font-bold text-foreground">Sanskrit Learner</h2>
          <p className="text-muted-foreground">Level 1 • Beginner</p>
        </div>
        <Link to="/dashboard">
          <Button variant="secondary">
            Back to Learning
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

const StatsOverview = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: "Day Streak", value: "7", icon: Flame, color: "text-accent", bg: "bg-accent/10" },
      { label: "Total XP", value: "250", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
      { label: "Lessons Done", value: "15", icon: BookOpen, color: "text-success", bg: "bg-success/10" },
      { label: "Hours Learned", value: "4.5", icon: Calendar, color: "text-accent-dark", bg: "bg-accent/10" },
    ].map((stat, index) => (
      <Card key={index} variant="default">
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

const LearningProgress = () => (
  <Card variant="elevated">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Learning Progress
      </CardTitle>
      <CardDescription>Your journey through Sanskrit</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {[
        { level: "Level 1", name: "Foundation", progress: 40, lessons: "2/5 lectures" },
        { level: "Level 2", name: "Building Blocks", progress: 0, lessons: "0/6 lectures", locked: true },
        { level: "Level 3", name: "Sentences", progress: 0, lessons: "0/8 lectures", locked: true },
      ].map((level, index) => (
        <div key={index} className={level.locked ? "opacity-50" : ""}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-foreground">{level.level}: {level.name}</h4>
              <p className="text-sm text-muted-foreground">{level.lessons}</p>
            </div>
            <span className="text-sm font-semibold text-primary">{level.progress}%</span>
          </div>
          <Progress value={level.progress} variant="default" size="default" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const Achievements = () => {
  const achievements = [
    { name: "First Step", description: "Complete your first lesson", icon: Star, earned: true },
    { name: "Week Warrior", description: "Maintain a 7-day streak", icon: Flame, earned: true },
    { name: "Sound Master", description: "Complete all vowel lessons", icon: Award, earned: true },
    { name: "Consistent Learner", description: "Study for 30 days", icon: Calendar, earned: false },
    { name: "Level Up", description: "Complete Level 1", icon: Trophy, earned: false },
    { name: "Scholar", description: "Reach 1000 XP", icon: Zap, earned: false },
  ];
  
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Achievements
        </CardTitle>
        <CardDescription>3 of 6 achievements earned</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border text-center transition-all ${
                achievement.earned 
                  ? "bg-accent/5 border-accent/20" 
                  : "bg-muted/50 border-border opacity-50"
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
          <ProfileHeader />
          <StatsOverview />
          <LearningProgress />
          <Achievements />
        </div>
      </main>
    </div>
  );
};

export default Profile;
