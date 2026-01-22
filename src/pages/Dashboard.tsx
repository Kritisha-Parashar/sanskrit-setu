import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, BookOpen, Star, ChevronRight, Settings, User, Zap, Crown, Target, Lock } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { useUserProgress } from "@/context/UserProgressContext";

const DashboardNavbar = () => {
  const { progress } = useUserProgress();

  return (
    <nav className="bg-primary-dark sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold text-primary-foreground">Sanskrit-Setu</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Stats Bar */}
          <div className="hidden md:flex items-center gap-4 bg-primary/30 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 text-accent">
              <Flame className="w-5 h-5" />
              <span className="font-bold text-primary-foreground">1</span>
            </div>
            <div className="w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2 text-golden">
              <Zap className="w-5 h-5" />
              <span className="font-bold text-primary-foreground">{progress.xp}</span>
            </div>
            <div className="w-px h-6 bg-primary-foreground/20" />
            <div className="flex items-center gap-2 text-purple">
              <Crown className="w-5 h-5" />
              <span className="font-bold text-primary-foreground">1</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/30">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/30">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const WelcomeSection = () => {
  const { progress } = useUserProgress();

  return (
    <div className="bg-card rounded-3xl shadow-card p-6 flex items-center gap-6">
      <InteractiveMascot
        mood="happy"
        size="lg"
        showHeart
        messages={[
          "You're doing great! 🔥",
          "Let's learn! 🎉",
          "Keep going! 💪",
          "संस्कृतम् rocks! ✨",
        ]}
      />
      <div className="flex-1">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Welcome back, Learner! 🙏
        </h2>
        <p className="text-muted-foreground">
          You have earned <span className="text-accent font-bold">{progress.xp} XP</span> today! Keep learning to unlock more.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-3 bg-accent/10 rounded-2xl p-4">
        <Flame className="w-8 h-8 text-accent animate-pulse-soft" />
        <div>
          <p className="text-sm text-muted-foreground">Total XP</p>
          <p className="text-2xl font-bold text-accent">{progress.xp}</p>
        </div>
      </div>
    </div>
  );
};

const LearningPath = () => {
  const { progress } = useUserProgress();

  const lessons = [
    { id: 1, lessonId: "LS001", title: "Vowels (Swar)", subtitle: "The 13 Vowels" },
    { id: 2, lessonId: "LS002", title: "Consonants I", subtitle: "Ka to Na" },
    { id: 3, lessonId: "LS003", title: "Consonants II", subtitle: "Pa to Gya" },
    { id: 4, lessonId: "LS004", title: "Vocabulary", subtitle: "Basic Words" },
    { id: 5, lessonId: "LS005", title: "Sentences", subtitle: "Common Phrases" },
  ];

  return (
    <div className="relative py-8">
      <h3 className="font-display text-xl font-bold text-foreground mb-6 text-center">
        Your Learning Path
      </h3>

      <div className="absolute left-1/2 top-20 bottom-0 w-1 bg-border -translate-x-1/2" />

      <div className="flex flex-col items-center gap-6 relative z-10">
        {lessons.map((lesson, index) => {
          const isUnlocked = progress.unlockedLessons.includes(lesson.lessonId);
          const isCompleted = progress.completedLessons.includes(lesson.lessonId);
          const isCurrent = isUnlocked && !isCompleted;

          return (
            <Link
              key={lesson.id}
              to={isUnlocked ? `/lectures/${lesson.lessonId}` : "#"}
              className={`relative group ${!isUnlocked ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {index < lessons.length - 1 && (
                <div className="absolute left-1/2 -bottom-4 w-2 h-2 bg-border rounded-full -translate-x-1/2" />
              )}

              <div
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold
                  transition-all duration-300 shadow-card
                  ${isCompleted
                    ? "bg-success text-success-foreground"
                    : isCurrent
                      ? "bg-accent text-accent-foreground animate-pulse-soft ring-4 ring-accent/30"
                      : "bg-muted text-muted-foreground"}
                  ${isUnlocked && "hover:scale-110 hover:shadow-elevated"}
                `}
              >
                {isCompleted ? (
                  <Star className="w-8 h-8 fill-current" />
                ) : !isUnlocked ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  <span>{lesson.id}</span>
                )}
              </div>

              <div className={`
                absolute left-full ml-4 top-1/2 -translate-y-1/2 
                bg-card rounded-xl p-3 shadow-elevated opacity-0 group-hover:opacity-100
                transition-all duration-200 pointer-events-none whitespace-nowrap z-20
                ${isCurrent ? "opacity-100" : ""}
              `}>
                <p className="font-bold text-foreground">{lesson.title}</p>
                <p className="text-sm text-muted-foreground">
                  {!isUnlocked ? "Locked" : lesson.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
        
        {/* ADDED: Coming Soon Text */}
        <div className="pt-8 pb-4 text-center opacity-50">
          <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">More Coming Soon...</p>
        </div>
      </div>
    </div>
  );
};

const DailyGoal = () => {
  const { progress } = useUserProgress();

  return (
    <Card className="bg-card border-0 shadow-card rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-golden/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-golden" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Progress</h3>
            <p className="text-sm text-muted-foreground">Keep unlocking lessons!</p>
          </div>
        </div>
        {/* Show progress bar based on lessons completed vs total lessons (5) */}
        <Progress value={(progress.completedLessons.length / 5) * 100} className="h-3 bg-muted" />
        <p className="text-sm text-muted-foreground mt-2">{progress.completedLessons.length} lessons complete</p>
      </CardContent>
    </Card>
  )
};

const StatsCards = () => {
  const { progress } = useUserProgress();

  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Total XP", value: progress.xp, icon: Zap, color: "bg-golden/20 text-golden" },
        { label: "Lessons", value: progress.completedLessons.length, icon: BookOpen, color: "bg-success/20 text-success" },
        { label: "Achievements", value: "3", icon: Trophy, color: "bg-purple/20 text-purple" },
        { label: "Level", value: "1", icon: Crown, color: "bg-pink/20 text-pink" },
      ].map((stat, index) => (
        <Card key={index} className="bg-card border-0 shadow-card rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const QuickActions = () => (
  <div className="space-y-4">
    <Link to="/lectures">
      <Card className="bg-primary hover:bg-primary-dark transition-colors border-0 shadow-card rounded-2xl cursor-pointer">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-primary-foreground">Continue Learning</h3>
            <p className="text-sm text-primary-foreground/70">Pick up where you left off</p>
          </div>
          <ChevronRight className="w-6 h-6 text-primary-foreground" />
        </CardContent>
      </Card>
    </Link>

    <Link to="/test-session">
      <Card className="bg-card hover:bg-muted transition-colors border-0 shadow-card rounded-2xl cursor-pointer">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <div className="text-2xl">🧪</div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Take Test</h3>
            <p className="text-sm text-muted-foreground">
              Test your pronunciation
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WelcomeSection />
              <LearningPath />
            </div>

            <div className="space-y-6">
              <DailyGoal />
              <StatsCards />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;