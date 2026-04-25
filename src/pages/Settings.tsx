import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Bell,
  Volume2,
  ShieldCheck,
  Languages,
  Globe,
  Trash2,
  Save,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUserProgress } from "@/context/UserProgressContext";
import { changePassword, getStoredUser } from "@/lib/auth";
import {
  fetchUserSettings,
  patchUserSettings,
  type EmailNotificationPreference,
} from "@/lib/userSettings";

const Settings = () => {
  const { resetProgress } = useUserProgress();
  const user = getStoredUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [settingsLoadError, setSettingsLoadError] = useState<string | null>(null);
  const [emailSuccessHint, setEmailSuccessHint] = useState<string | null>(null);
  const [emailPreference, setEmailPreference] = useState<EmailNotificationPreference>("none");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Settings state logic
  const [settings, setSettings] = useState({
    soundEffects: true,
    darkMode: false,
    publicProfile: true
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setEmailPreference("none");
        return;
      }
      const data = await fetchUserSettings();
      if (cancelled) return;
      if (!data) {
        setSettingsLoadError("Could not load email preferences. Try signing in again.");
        return;
      }
      setSettingsLoadError(null);
      setEmailPreference(data.emailNotificationPreference);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetProgress = async () => {
    if (!window.confirm("Are you sure? All XP, completed lessons, and unlocked lessons will be reset. Only the first lesson will remain unlocked.")) return;
    setIsResetting(true);
    try {
      const ok = await resetProgress();
      if (ok) alert("Progress reset successfully. You’re back to the start with only the first lesson unlocked.");
      else alert("Failed to reset progress. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!user) {
        alert("Sign in to save email preferences. Other options are local only for now.");
        return;
      }
      const result = await patchUserSettings(emailPreference);
      if (!result) {
        alert("Could not save email preferences. Try signing in again.");
        return;
      }
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      if (result.emailDispatch?.attempted && !result.emailDispatch.ok) {
        alert(
          `Settings saved, but the notification email could not be sent.\n\n${result.emailDispatch.error ?? "Check server logs and RESEND_API_KEY."}\n\nNote: onboarding@resend.dev only delivers to your Resend signup email until you add a verified domain.`,
        );
      } else if (result.emailDispatch?.attempted && result.emailDispatch.ok && emailPreference !== "none") {
        alert("Settings saved. A notification email was sent (check spam).");
      } else {
        alert("Settings saved.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailPreferenceChange = async (v: string) => {
    const pref = v as EmailNotificationPreference;
    if (pref === emailPreference) return;
    const rollback = emailPreference;
    setEmailPreference(pref);
    if (!user) return;

    setEmailSaving(true);
    setSettingsLoadError(null);
    setEmailSuccessHint(null);
    try {
      const result = await patchUserSettings(pref);
      if (!result) {
        setEmailPreference(rollback);
        setSettingsLoadError("Could not save. Try signing in again.");
        return;
      }
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      if (result.emailDispatch?.attempted && result.emailDispatch.ok) {
        setEmailSuccessHint(
          "Notification email sent. Check inbox and spam. With Resend’s test sender, only your Resend-account email may receive mail until you verify a domain.",
        );
      } else if (result.emailDispatch?.attempted && !result.emailDispatch.ok) {
        setSettingsLoadError(
          result.emailDispatch.error ??
            "Preference saved, but email was not sent (check RESEND_API_KEY on the server).",
        );
      }
    } catch {
      setEmailPreference(rollback);
      setSettingsLoadError("Could not update email preference.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (!user) {
      setPasswordError("Sign in to change your password.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      alert("Password updated. Other devices may need to sign in again.");
    } catch (e: unknown) {
      setPasswordError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsChangingPassword(false);
    }
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

                {/* Language Selection */}
                <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple/10 rounded-xl flex items-center justify-center text-purple">
                      <Languages className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Interface Language</p>
                      <p className="text-xs text-muted-foreground">English (US)</p>
                    </div>
                  </div>
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
                <div className="p-6 flex items-center justify-between group hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Account Password</p>
                      <p className="text-xs text-muted-foreground">Secure your learning progress</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-primary font-bold hover:bg-primary/10 rounded-xl"
                    disabled={!user}
                    onClick={() => {
                      setPasswordError(null);
                      setPasswordDialogOpen(true);
                    }}
                  >
                    Update
                  </Button>
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
                <Button
                  variant="outline"
                  onClick={handleResetProgress}
                  disabled={isResetting}
                  className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all"
                >
                  {isResetting ? "Resetting..." : "Reset"}
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

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new one (at least 6 characters). Existing refresh sessions will be signed out for security.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setPasswordDialogOpen(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-primary"
              onClick={() => void handleChangePassword()}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Updating…" : "Update password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;