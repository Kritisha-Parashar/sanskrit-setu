import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import teacher from "@/assets/teacher.png";
import heroBg from "@/assets/hero-bg.png";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/95 backdrop-blur-lg">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <span className="font-display text-2xl font-bold text-primary-foreground">Sanskrit-Setu</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/30">
            Log In
          </Button>
        </Link>
        <Link to="/login">
          <Button className="bg-accent hover:bg-accent-dark text-accent-foreground font-bold rounded-xl px-6">
            Start Learning
          </Button>
        </Link>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
    <div 
      className="absolute inset-0 bg-cover bg-center opacity-20"
      style={{ backgroundImage: `url(${heroBg})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/80" />
    
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-card/90 text-foreground px-4 py-2 rounded-full mb-6 shadow-soft">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm">Ancient Language, Modern Learning</span>
          </div>
          
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Learn <span className="text-accent">Sanskrit</span> the Fun Way
          </h1>
          
          <p className="text-xl text-foreground/80 mb-8 max-w-lg">
            Master the mother of languages with authentic pronunciation, 
            scholar-led teaching, and a step-by-step journey from basics to fluency.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard">
              <Button className="bg-accent hover:bg-accent-dark text-accent-foreground font-bold text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                Start Learning Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="bg-card/80 hover:bg-card text-foreground font-bold text-lg px-8 py-6 rounded-2xl border-2">
                I Have an Account
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-card/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm text-foreground font-medium">10,000+ Learners</span>
            </div>
            <div className="flex items-center gap-2 bg-card/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-foreground font-medium">50+ Lessons</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-card/60 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-golden" />
              <span className="text-sm text-foreground font-medium">Expert Teachers</span>
            </div>
          </div>
        </div>
        
        <div className="relative animate-fade-in hidden lg:flex items-center justify-center">
          <div className="relative">
            <img 
              src={teacher} 
              alt="Sanskrit teacher" 
              className="w-80 h-auto mx-auto drop-shadow-2xl"
            />
            <div className="absolute -bottom-4 -left-8">
              <InteractiveMascot 
                mood="happy" 
                size="lg"
                showHeart
                messages={[
                  "नमस्ते! 🙏",
                  "Let's learn! 📚",
                  "Sanskrit is fun! ✨",
                  "Join us today! 🎉",
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-24 bg-card">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="font-display text-4xl font-bold text-foreground mb-4">
          Why Learn Sanskrit with Us?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our unique approach combines ancient wisdom with modern technology
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: "🎯",
            title: "Scholar-Led Teaching",
            description: "Learn from experts who bring authentic pronunciation and deep knowledge of Sanskrit texts.",
            color: "bg-accent/10 border-accent/20"
          },
          {
            icon: "📚",
            title: "Step-by-Step Lectures",
            description: "Structured learning path from basic sounds to complex sentences, designed for all ages.",
            color: "bg-primary/10 border-primary/20"
          },
          {
            icon: "🧘",
            title: "Calm Learning Experience",
            description: "A peaceful, focused environment that helps you absorb and retain the language naturally.",
            color: "bg-purple/10 border-purple/20"
          }
        ].map((feature, index) => (
          <div 
            key={index}
            className={`${feature.color} border-2 rounded-3xl p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-2`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="font-display text-xl font-bold text-foreground mb-3">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-24 bg-primary relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/50 to-transparent" />
    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
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
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl">
            Join thousands of learners discovering the beauty of Sanskrit. 
            Start with basic sounds and build your way to reading ancient texts.
          </p>
          <Link to="/dashboard">
            <Button className="bg-accent hover:bg-accent-dark text-accent-foreground font-bold text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              Start Learning Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-primary-dark py-12">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold text-primary-foreground">Sanskrit-Setu</span>
        </div>
        <p className="text-primary-foreground/70 text-sm">
          © 2024 Sanskrit-Setu. Bridge to Ancient Wisdom.
        </p>
      </div>
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
