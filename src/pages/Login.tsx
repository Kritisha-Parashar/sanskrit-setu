import { useState } from "react";
import { login, signup } from "../lib/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";
import { getAuth, signOut } from "firebase/auth";


const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (isLogin) {
      await login(email, password);
    } else {
      await signup(email, password);
    }

    navigate("/dashboard");
  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Mascot Area */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative">
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
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-foreground">Sanskrit-Setu</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl shadow-elevated p-8 lg:p-10">
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
              <div>
                <Input 
                  type="email" 
                  placeholder="Email or Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-base bg-input border-0 rounded-2xl px-5"
                />
              </div>
              
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 text-base bg-input border-0 rounded-2xl px-5 pr-14"
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
                className="w-full h-14 text-lg font-bold rounded-2xl duolingo-button bg-primary text-primary-foreground"
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
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl border-2 bg-card hover:bg-muted font-semibold">
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>

            <p className="text-center mt-8 text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
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
