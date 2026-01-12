import { logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { User, Bell, Lock, Globe } from "lucide-react";
import { useUserProgress } from "@/context/UserProgressContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logoutUser } = useUserProgress();

  // Logout function
  const handleLogout = async () => {
    try {
      await logout();
      logoutUser();
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      alert("Failed to log out. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-4xl space-y-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Settings</h1>

        {/* Account Settings */}
        <Card className="bg-card border-0 shadow-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Account
            </CardTitle>
            <CardDescription>Manage your account info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Change Username</span>
              <Button variant="secondary" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Change Password</span>
              <Button variant="secondary" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-0 shadow-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" /> Notifications
            </CardTitle>
            <CardDescription>Customize your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="bg-card border-0 shadow-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple" /> Privacy
            </CardTitle>
            <CardDescription>Control your data visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Make Profile Public</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span>Show Achievements</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="bg-card border-0 shadow-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-golden" /> Language
            </CardTitle>
            <CardDescription>Select your preferred language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>App Language</span>
              <select className="bg-muted/20 px-3 py-1 rounded-lg border border-border">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="sa">Sanskrit</option>
              </select>
            </div>
          </CardContent>
        </Card>
        {/* Log Out Button */}
        <div className="pt-6">
          <Button
            variant="destructive"
            className="w-full rounded-3xl"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
