import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"; // Optional: Keep if you use Shadcn Toasts
import { Toaster as Sonner } from "@/components/ui/sonner"; // Optional: Keep if you use Sonner
import { TooltipProvider } from "@/components/ui/tooltip"; // Optional: For tooltips

// --- CRITICAL IMPORT ---
import { UserProgressProvider } from "./context/UserProgressContext"; 

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lectures from "./pages/Lectures";
import LessonPlayer from "./pages/LessonPlayer"; 
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <UserProgressProvider> {/* 1. Wraps App to provide XP/Unlock data */}
      <TooltipProvider>    {/* 2. UI Tooltips */}
        <Toaster />        {/* 3. Toast Notifications */}
        <Sonner />
        
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* App Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* The List of all lectures */}
            <Route path="/lectures" element={<Lectures />} />

            {/* The Actual Player */}
            <Route path="/lectures/:lectureId" element={<LessonPlayer />} />

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        
      </TooltipProvider>
    </UserProgressProvider> 
  );
};

export default App;