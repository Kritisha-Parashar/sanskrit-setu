import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, BookOpen, Star, ChevronRight, Settings, User, Zap, Crown, Target } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";

const DashboardNavbar = () => (
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
            <span className="font-bold text-primary-foreground">7</span>
          </div>
          <div className="w-px h-6 bg-primary-foreground/20" />
          <div className="flex items-center gap-2 text-golden">
            <Zap className="w-5 h-5" />
            <span className="font-bold text-primary-foreground">250</span>
          </div>
          <div className="w-px h-6 bg-primary-foreground/20" />
          <div className="flex items-center gap-2 text-purple">
            <Crown className="w-5 h-5" />
            <span className="font-bold text-primary-foreground">3</span>
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

const WelcomeSection = () => (
  <div className="bg-card rounded-3xl shadow-card p-6 flex items-center gap-6">
    <InteractiveMascot
      mood="happy"
      size="lg"
      showHeart
      messages={[
        "You're on fire! 🔥",
        "7 day streak! 🎉",
        "Keep going! 💪",
        "संस्कृतम् rocks! ✨",
      ]}
    />
    <div className="flex-1">
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">
        Welcome back, Learner! 🙏
      </h2>
      <p className="text-muted-foreground">
        You're on a <span className="text-accent font-bold">7 day streak</span>! Keep learning to maintain your progress.
      </p>
    </div>
    <div className="hidden md:flex items-center gap-3 bg-accent/10 rounded-2xl p-4">
      <Flame className="w-8 h-8 text-accent animate-pulse-soft" />
      <div>
        <p className="text-sm text-muted-foreground">Current Streak</p>
        <p className="text-2xl font-bold text-accent">7 days</p>
      </div>
    </div>
  </div>
);

const LearningPath = () => {
  const lessons = [
    { id: 1, title: "Basic Sounds", subtitle: "क ख ग", completed: true, current: false, locked: false },
    { id: 2, title: "Vowels", subtitle: "अ आ इ ई", completed: true, current: false, locked: false },
    { id: 3, title: "Two Letters", subtitle: "Words", completed: false, current: true, locked: false },
    { id: 4, title: "Simple Words", subtitle: "Practice", completed: false, current: false, locked: true },
    { id: 5, title: "Sentences", subtitle: "Basics", completed: false, current: false, locked: true },
  ];

  return (
    <div className="relative py-8">
      <h3 className="font-display text-xl font-bold text-foreground mb-6 text-center">
        Your Learning Path
      </h3>

      {/* Vertical Path Line */}
      <div className="absolute left-1/2 top-20 bottom-0 w-1 bg-border -translate-x-1/2" />

      <div className="flex flex-col items-center gap-6 relative z-10">
        {lessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            to={lesson.locked ? "#" : "/lesson/1"}
            className={`relative group ${lesson.locked ? "cursor-not-allowed" : ""}`}
          >
            {/* Connector dot */}
            {index < lessons.length - 1 && (
              <div className="absolute left-1/2 -bottom-4 w-2 h-2 bg-border rounded-full -translate-x-1/2" />
            )}

            <div
              className={`
                w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold
                transition-all duration-300 shadow-card
                ${lesson.completed
                  ? "bg-success text-success-foreground"
                  : lesson.current
                    ? "bg-accent text-accent-foreground animate-pulse-soft ring-4 ring-accent/30"
                    : lesson.locked
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"}
                ${!lesson.locked && "hover:scale-110 hover:shadow-elevated"}
              `}
            >
              {lesson.completed ? (
                <Star className="w-8 h-8 fill-current" />
              ) : lesson.locked ? (
                <span className="text-xl">🔒</span>
              ) : (
                <span>{lesson.id}</span>
              )}
            </div>

            {/* Tooltip */}
            <div className={`
              absolute left-full ml-4 top-1/2 -translate-y-1/2 
              bg-card rounded-xl p-3 shadow-elevated opacity-0 group-hover:opacity-100
              transition-all duration-200 pointer-events-none whitespace-nowrap
              ${lesson.current ? "opacity-100" : ""}
            `}>
              <p className="font-bold text-foreground">{lesson.title}</p>
              <p className="text-sm text-muted-foreground">{lesson.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const DailyGoal = () => (
  <Card className="bg-card border-0 shadow-card rounded-3xl overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-golden/20 flex items-center justify-center">
          <Target className="w-6 h-6 text-golden" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Daily Goal</h3>
          <p className="text-sm text-muted-foreground">Complete 3 lessons today</p>
        </div>
      </div>
      <Progress value={66} className="h-3 bg-muted" />
      <p className="text-sm text-muted-foreground mt-2">2 of 3 lessons complete</p>
    </CardContent>
  </Card>
);

const StatsCards = () => (
  <div className="grid grid-cols-2 gap-4">
    {[
      { label: "Total XP", value: "250", icon: Zap, color: "bg-golden/20 text-golden" },
      { label: "Lessons", value: "15", icon: BookOpen, color: "bg-success/20 text-success" },
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

    <Link to="/lectures">
      <Card className="bg-card hover:bg-muted transition-colors border-0 shadow-card rounded-2xl cursor-pointer">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Browse All Lectures</h3>
            <p className="text-sm text-muted-foreground">Explore available lessons</p>
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
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <WelcomeSection />
              <LearningPath />
            </div>

            {/* Sidebar - Right Side */}
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
