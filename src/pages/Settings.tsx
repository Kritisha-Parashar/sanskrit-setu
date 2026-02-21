import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Bell, Moon, Volume2, ShieldCheck, 
  Languages, Globe, Trash2, Eye, EyeOff, Save,
  Database, Smartphone, HelpCircle, ChevronRight // Added ChevronRight here
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUserProgress } from "@/context/UserProgressContext";
import { getStoredUser } from "@/lib/auth";

const Settings = () => {
  const { progress } = useUserProgress();
  const user = getStoredUser();
  const [isSaving, setIsSaving] = useState(false);

  // Settings state logic
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    darkMode: false,
    publicProfile: true
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Logic: Connect this to your PUT /api/user/settings backend endpoint
    setTimeout(() => setIsSaving(false), 1000); 
  };

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      {/* --- NAVBAR --- */}
      <nav className="bg-primary-dark sticky top-0 z-[60] shadow-lg">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-primary-foreground group-hover:-translate-x-1 transition-transform" />
            <span className="font-display text-2xl font-bold text-primary-foreground">Settings</span>
          </Link>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-6 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </nav>

      <main className="max-w-[900px] mx-auto px-8 py-12">
        <div className="space-y-8">
          
          {/* --- SECTION: APP EXPERIENCE --- */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-6 opacity-60">Experience</h3>
            <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-xl overflow-hidden">
              <div className="divide-y divide-black/[0.05]">
                
                {/* Sound Effects Toggle */}
                <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-golden/10 rounded-xl flex items-center justify-center text-golden">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Sound Effects</p>
                      <p className="text-xs text-muted-foreground">Play audio during lessons and games</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('soundEffects')}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.soundEffects ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEffects ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Notifications Toggle */}
                <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Learning Reminders</p>
                      <p className="text-xs text-muted-foreground">Get notified to keep your daily streak</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('notifications')}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Language Selection */}
                <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple/10 rounded-xl flex items-center justify-center text-purple">
                      <Languages className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Interface Language</p>
                      <p className="text-xs text-muted-foreground">English (US)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                </div>

              </div>
            </div>
          </section>

          {/* --- SECTION: PRIVACY & SECURITY --- */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-6 opacity-60">Security</h3>
            <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-xl overflow-hidden">
              <div className="divide-y divide-black/[0.05]">
                
                {/* Public Profile Toggle */}
                <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Public Profile</p>
                      <p className="text-xs text-muted-foreground">Allow others to see your badges and XP</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('publicProfile')}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.publicProfile ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.publicProfile ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Change Password */}
                <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Account Password</p>
                      <p className="text-xs text-muted-foreground">Secure your learning progress</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-primary font-bold hover:bg-primary/10 rounded-xl">Update</Button>
                </div>

              </div>
            </div>
          </section>

          {/* --- SECTION: DANGER ZONE --- */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-destructive uppercase tracking-[0.2em] ml-6 opacity-60">Danger Zone</h3>
            <div className="bg-destructive/5 backdrop-blur-md rounded-[2.5rem] border border-destructive/10 shadow-xl overflow-hidden">
              <div className="p-6 flex items-center justify-between group hover:bg-destructive/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-destructive">Reset Progress</p>
                    <p className="text-xs text-destructive/60">Erase all lessons, XP, and badges</p>
                  </div>
                </div>
                <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all">
                  Reset
                </Button>
              </div>
            </div>
          </section>

          {/* --- FOOTER --- */}
          <div className="text-center pt-8 space-y-4 opacity-40">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sanskrit-Setu v1.0.4</p>
            <div className="flex justify-center gap-6">
               <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Help Center</span>
               <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Privacy</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;