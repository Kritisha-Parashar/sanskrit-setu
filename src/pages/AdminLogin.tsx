import { useState } from "react";
import { login } from "../lib/auth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Shield } from "lucide-react";

const AdminLogin = () => {
  //const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const response = await login(email, password);      //POST request to /api/auth/login with email and password

    if (!response.user || response.user.role !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }

    navigate("/admin/dashboard");
  } catch (err: unknown) {
    setError(err.message || "Invalid credentials");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Desktop View */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative bg-muted/10">
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-foreground">Sanskrit-Setu</span>
          </Link>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-elevated">
            <Shield className="w-16 h-16 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center">Admin Portal</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Manage lessons, track performance, and oversee the platform
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-card border-l border-border">
        <div className="w-full max-w-md animate-scale-in">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="font-display text-2xl font-bold text-foreground">Sanskrit-Setu</span>
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Admin Portal
          </h1>
          <p className="text-muted-foreground">
            Access the admin dashboard
          </p>


            <form onSubmit={handleSubmit} className="space-y-5">
              {successMessage && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              <Input 
                type="email" 
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12">
                {loading ? "Processing..." : "Log In"}
              </Button>

            </form>

            {/*<div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "Need an admin account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>*/}

            <div className="mt-4 pt-4 border-t border-border">
              <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                ← Back to Student Login
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminLogin;