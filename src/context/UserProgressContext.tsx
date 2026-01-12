import React, { createContext, useContext, useState, useEffect } from "react";
import { isAuthenticated, getProgress, updateProgress } from "@/lib/auth";

interface UserProgress {
  xp: number;
  completedLessons: number[];
  unlockedLessons: number[];
}

interface UserProgressContextType {
  progress: UserProgress;
  completeLesson: (lessonId: number, score: number) => void;
  startGuestSession: () => void; // For Index page
  loginUser: () => void;         // For Login page
  logoutUser: () => void;        // For Settings page
  isLoggedIn: boolean;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Check if we are in "User Mode" (Logged in) - use auth token
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return isAuthenticated();
  });

  // Monitor auth token changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
    };

    // Check on mount and periodically
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Initialize Progress
  const [progress, setProgress] = useState<UserProgress>(() => {
    // Start with default for guest mode
    return { xp: 0, completedLessons: [], unlockedLessons: [1] };
  });

  // 3. Load progress from API when logged in
  useEffect(() => {
    const loadProgressFromAPI = async () => {
      if (isLoggedIn) {
        try {
          const apiProgress = await getProgress();
          if (apiProgress) {
            console.log("Loaded progress from API:", apiProgress);
            setProgress(apiProgress);
          } else {
            // If no progress exists, initialize with defaults
            const defaultProgress = { xp: 0, completedLessons: [], unlockedLessons: [1] };
            setProgress(defaultProgress);
            await updateProgress(defaultProgress);
          }
        } catch (error) {
          console.error("Failed to load progress from API:", error);
          // Fallback to localStorage if API fails
          const saved = localStorage.getItem("sanskritUserProgress");
          if (saved) {
            setProgress(JSON.parse(saved));
          }
        }
      }
    };

    loadProgressFromAPI();
  }, [isLoggedIn]);

  // 4. Save to API when progress changes (if logged in)
  useEffect(() => {
    const saveProgressToAPI = async () => {
      if (isLoggedIn) {
        try {
          const success = await updateProgress(progress);
          if (success) {
            console.log("Progress saved to database:", progress);
            // Also save to localStorage as backup
            localStorage.setItem("sanskritUserProgress", JSON.stringify(progress));
          } else {
            console.warn("Failed to save progress to API, saving to localStorage only");
            localStorage.setItem("sanskritUserProgress", JSON.stringify(progress));
          }
        } catch (error) {
          console.error("Error saving progress:", error);
          // Fallback to localStorage
          localStorage.setItem("sanskritUserProgress", JSON.stringify(progress));
        }
      } else {
        // Guest mode: only save to localStorage
        localStorage.setItem("sanskritUserProgress", JSON.stringify(progress));
      }
    };

    // Debounce API calls - only save after user stops making changes
    const timeoutId = setTimeout(saveProgressToAPI, 500);
    return () => clearTimeout(timeoutId);
  }, [progress, isLoggedIn]);

  const completeLesson = (lessonId: number, score: number) => {
    if (score < 75) return;

    const isReplay = progress.completedLessons.includes(lessonId);
    const xpGained = isReplay ? 10 : 50;
    const nextLessonId = lessonId + 1;

    setProgress((prev) => {
      const newUnlocked = prev.unlockedLessons.includes(nextLessonId) 
        ? prev.unlockedLessons 
        : [...prev.unlockedLessons, nextLessonId];

      return {
        xp: prev.xp + xpGained,
        completedLessons: isReplay ? prev.completedLessons : [...prev.completedLessons, lessonId],
        unlockedLessons: newUnlocked,
      };
    });
  };

  // Called when clicking "Start Learning" on Index
  const startGuestSession = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn"); // Remove persistent flag
    setProgress({ xp: 0, completedLessons: [], unlockedLessons: [1] }); // Force reset
  };

  // Called when Login is successful
  const loginUser = async () => {
    setIsLoggedIn(true);
    // Progress will be loaded from API via useEffect
    // Try to load from API first, fallback to localStorage
    try {
      const apiProgress = await getProgress();
      if (apiProgress) {
        setProgress(apiProgress);
      } else {
        // If no API progress, check localStorage and sync to API
        const saved = localStorage.getItem("sanskritUserProgress");
        if (saved) {
          const localProgress = JSON.parse(saved);
          setProgress(localProgress);
          await updateProgress(localProgress);
        }
      }
    } catch (error) {
      console.error("Error loading progress on login:", error);
      // Fallback to localStorage
      const saved = localStorage.getItem("sanskritUserProgress");
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    }
  };

  // Called on Logout
  const logoutUser = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    setProgress({ xp: 0, completedLessons: [], unlockedLessons: [1] });
  };

  return (
    <UserProgressContext.Provider value={{ progress, completeLesson, startGuestSession, loginUser, logoutUser, isLoggedIn }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) throw new Error("useUserProgress must be used within UserProgressProvider");
  return context;
};