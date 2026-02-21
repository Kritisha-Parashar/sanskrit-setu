import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import teacher1 from "@/assets/teacher1.png";
import heroBg from "@/assets/hero-bg.png";
import { useUserProgress } from "@/context/UserProgressContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { startGuestSession } = useUserProgress();

  const handleStart = () => {
    startGuestSession();
    navigate("/dashboard");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-2xl tracking-wide font-semibold text-primary-foreground">
            Sanskrit–Setu
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-all"
            >
              Log In
            </Button>
          </Link>

          <Button
            onClick={handleStart}
            className="bg-accent/90 hover:bg-accent text-accent-foreground font-semibold rounded-full px-6 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Start Learning
          </Button>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { startGuestSession } = useUserProgress();

  const handleStartFresh = () => {
    startGuestSession();
    navigate("/dashboard");
  };

  return (
    <section className="relative min-h-[92vh] flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 blur-[2px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md text-foreground px-4 py-2 rounded-full mb-8 border border-white/10 shadow-sm">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm tracking-wide">
                Ancient Language, Modern Learning
              </span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
              Learn{" "}
              <span className="text-accent relative">
                Sanskrit
                <span className="absolute -bottom-2 left-0 w-full h-[6px] bg-accent/30 rounded-full blur-sm"></span>
              </span>{" "}
              the Fun Way
            </h1>

            <p className="text-lg text-foreground/70 mb-10 max-w-xl leading-relaxed">
              Master the mother of languages with authentic pronunciation,
              scholar-led teaching, and a step-by-step journey from basics to
              fluency.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleStartFresh}
                className="bg-accent hover:bg-accent-dark text-accent-foreground font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Learning Free
              </Button>

              <Link to="/login">
                <Button
                  variant="outline"
                  className="bg-card/60 backdrop-blur-md hover:bg-card text-foreground font-semibold text-lg px-8 py-6 rounded-full border border-white/20 transition-all"
                >
                  I Have an Account
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-10 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-foreground font-medium">
                  10,000+ Learners
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm text-foreground font-medium">
                  50+ Lessons
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-sm text-foreground font-medium">
                  Expert Teachers
                </span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="relative hidden lg:flex items-center justify-center animate-fade-in">
            <div className="relative">
              <img
                src={teacher1}
                alt="Sanskrit teacher"
                className="w-80 sm:w-96 lg:w-[34rem] h-auto mx-auto drop-shadow-2xl"
              />
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => (
  <section className="py-28 bg-card">
    <div className="container mx-auto px-6">
      <div className="text-center mb-20">
        <h2 className="font-display text-4xl font-semibold text-foreground mb-4 tracking-tight">
          Why Learn Sanskrit with Us?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Our unique approach combines ancient wisdom with modern technology.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {[
          {
            icon: "🎯",
            title: "Scholar-Led Teaching",
            description:
              "Learn from experts who bring authentic pronunciation and deep knowledge of Sanskrit texts.",
          },
          {
            icon: "📚",
            title: "Step-by-Step Lectures",
            description:
              "Structured learning path from basic sounds to complex sentences, designed for all ages.",
          },
          {
            icon: "🧘",
            title: "Calm Learning Experience",
            description:
              "A peaceful, focused environment that helps you absorb and retain the language naturally.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-4xl mb-6">{feature.icon}</div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-28 bg-primary relative overflow-hidden border-t border-white/10">
    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/50 to-transparent" />
    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="lg:w-1/3 flex justify-center">
          <InteractiveMascot
            mood="celebrate"
            size="xl"
            messages={[
              "Ready to start? 🚀",
              "Let's do this! 💪",
              "I believe in you! ⭐",
              "Join us! 🎉",
            ]}
          />
        </div>

        <div className="lg:w-2/3 text-center lg:text-left">
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6 tracking-tight">
            Ready to Begin Your Journey?
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl leading-relaxed">
            Join thousands of learners discovering the beauty of Sanskrit.
            Start with basic sounds and build your way to reading ancient texts.
          </p>

          <Link to="/dashboard">
            <Button className="bg-accent hover:bg-accent-dark text-accent-foreground font-semibold text-lg px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              Start Learning Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-primary-dark/95 backdrop-blur-md py-10 border-t border-white/10">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <span className="font-display text-xl font-semibold tracking-wide text-primary-foreground">
        Sanskrit–Setu
      </span>
      <p className="text-primary-foreground/60 text-sm tracking-wide">
        © 2026 Sanskrit–Setu. Bridge to Ancient Wisdom made with coffee and love.
      </p>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;