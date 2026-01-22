import { useState } from "react";
import { login, signup } from "../lib/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { useUserProgress } from "@/context/UserProgressContext"; 

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { loginUser } = useUserProgress(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        // Login flow - authenticate and redirect
        await login(email, password);
        
        // Update user context
        loginUser();

        navigate("/dashboard");
      } else {
        // Signup flow - create account but don't auto-login
        await signup(email, password);
        
        // Show success message and switch to login mode
        setSuccessMessage("Account created successfully! Please log in to continue.");
        setIsLogin(true);
        setPassword(""); // Clear password field
        setError(null);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const errorMessage = err.message || (isLogin ? "Login failed. Please check your credentials." : "Signup failed. Please try again.");
      setError(errorMessage);
      
      // Also show alert for now (can be removed later)
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Mascot Area */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative bg-muted/10">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-foreground">Sanskrit-Setu</span>
          </Link>
        </div>

        {/* Mascot with interaction */}
        <div className="flex flex-col items-center gap-8">
          <InteractiveMascot
            mood="happy"
            size="xl"
            showHeart
            messages={[
              "Welcome back! 🙏",
              "Ready to learn? 📚",
              "नमस्ते! Let's go! ✨",
              "You're awesome! 🌟",
            ]}
          />
          
          <h2 className="text-2xl font-bold text-foreground text-center">
            Learn Sanskrit the fun way!
          </h2>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-card border-l border-border">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-foreground">Sanskrit-Setu</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl shadow-elevated p-8 lg:p-10 border border-border">
            {/* Mobile Mascot */}
            <div className="lg:hidden flex justify-center mb-6">
              <InteractiveMascot mood="happy" size="lg" showHeart />
            </div>

            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome Back!" : "Join the Journey!"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin 
                  ? "Continue your Sanskrit learning journey" 
                  : "Start your Sanskrit learning adventure"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-2xl text-sm">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <Input 
                  type="email" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="h-14 text-base bg-input border-0 rounded-2xl px-5"
                  required
                />
              </div>
              
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="h-14 text-base bg-input border-0 rounded-2xl px-5 pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-sm text-accent hover:underline font-semibold">
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-bold rounded-2xl duolingo-button bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Log In"
                  : "Create Account"}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground uppercase tracking-wider">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-14 rounded-2xl border-2 bg-card hover:bg-muted font-semibold">
                Google
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl border-2 bg-card hover:bg-muted font-semibold">
                Facebook
              </Button>
            </div>

            <p className="text-center mt-8 text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-accent font-bold hover:underline"
              >
                {isLogin ? "Sign up for free" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;