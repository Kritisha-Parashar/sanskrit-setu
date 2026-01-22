import React, { createContext, useContext, useState, useEffect } from "react";
import { isAuthenticated, getProgress, updateProgress } from "@/lib/auth";

interface UserProgress {
  xp: number;
  completedLessons: string[];   
  unlockedLessons: string[];    
}

interface UserProgressContextType {
  progress: UserProgress;
  completeLesson: (
    lessonId: string,
    score: number,
    orderedLessonIds: string[]
  ) => void;
  startGuestSession: () => void;
  loginUser: () => void;
  logoutUser: () => void;
  isLoggedIn: boolean;
}

/* ---------------- CONTEXT ---------------- */

const UserProgressContext =
  createContext<UserProgressContextType | undefined>(undefined);

/* ---------------- PROVIDER ---------------- */

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

    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Initialize Progress
  const [progress, setProgress] = useState<UserProgress>(() => {
    // If logged in, try to load from local storage first (backup), else default
    // If GUEST (not logged in), ALWAYS start fresh (default)
    if (isAuthenticated()) {
        const saved = localStorage.getItem("sanskritUserProgress");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const unlocked = parsed.unlockedLessons || [];
            if (!unlocked.includes('LS001')) {
              parsed.unlockedLessons = ['LS001', ...unlocked];
            }
            return parsed;
          } catch {
            return { xp: 0, completedLessons: [], unlockedLessons: ["LS001"] };
          }
        }
    }
    // Guest mode or no saved data -> Default
    return { xp: 0, completedLessons: [], unlockedLessons: ["LS001"] };
  });

  // 3. Load progress from API when logged in
  useEffect(() => {
    const loadProgressFromAPI = async () => {
      if (isLoggedIn) {
        try {
          const apiProgress = await getProgress();
          if (apiProgress) {
            console.log("Loaded progress from API:", apiProgress);
            let unlockedLessons = (apiProgress.unlockedLessons || []).map(String);
            // ALWAYS ensure LS001 is unlocked
            if (!unlockedLessons.includes('LS001')) {
              unlockedLessons.unshift('LS001');
            }
            
            const normalizedProgress: UserProgress = {
              ...apiProgress,
              completedLessons: (apiProgress.completedLessons || []).map(String),
              unlockedLessons: unlockedLessons,
            };
            setProgress(normalizedProgress);
          } else {
            // If no progress exists, initialize with defaults
            const defaultProgress: UserProgress = { xp: 0, completedLessons: [], unlockedLessons: ["LS001"] };
            setProgress(defaultProgress);
            await updateProgress(defaultProgress);
          }
        } catch (error) {
          console.error("Failed to load progress from API:", error);
        }
      }
      // If Guest, we do NOTHING here (keep the default state from init)
    };

    loadProgressFromAPI();
  }, [isLoggedIn]);

  // 4. Save to API/Local when progress changes
  useEffect(() => {
    const saveProgressToAPI = async () => {
      if (isLoggedIn) {
        // User Mode: Save to API and LocalStorage
        try {
          const success = await updateProgress(progress);
          if (!success) console.warn("Failed to save to API");
        } catch (error) {
          console.error("Error saving progress:", error);
        }
        localStorage.setItem("sanskritUserProgress", JSON.stringify(progress));
      } else {
        // Guest Mode: DO NOT SAVE to localStorage (Progress resets on refresh)
        // We intentionally do nothing here.
      }
    };

    const timeoutId = setTimeout(saveProgressToAPI, 500);
    return () => clearTimeout(timeoutId);
  }, [progress, isLoggedIn]);

  /* ---------------- COMPLETE LESSON ---------------- */

  const completeLesson = (
    lessonId: string,
    score: number,
    orderedLessonIds: string[]
  ) => {
    if (score < 75) return;

    setProgress((prev) => {
      // XP Logic: Check if already completed
      const isReplay = prev.completedLessons.includes(lessonId);
      const xpGained = isReplay ? 0 : 50; // 0 if replay, 50 if new

      // find current lesson index
      const currentIndex = orderedLessonIds.indexOf(lessonId);
      const nextLessonId = orderedLessonIds[currentIndex + 1];

      const newUnlockedLessons = nextLessonId
        ? prev.unlockedLessons.includes(nextLessonId)
          ? prev.unlockedLessons
          : [...prev.unlockedLessons, nextLessonId]
        : prev.unlockedLessons;

      return {
        xp: prev.xp + xpGained,
        completedLessons: isReplay
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
        unlockedLessons: newUnlockedLessons,
      };
    });
  };

  /* ---------------- SESSION HANDLERS ---------------- */

  const startGuestSession = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sanskritUserProgress"); // Clear any stale data
    setProgress({
      xp: 0,
      completedLessons: [],
      unlockedLessons: ["LS001"],
    });
  };

  const loginUser = async () => {
    setIsLoggedIn(true);
    // Data load triggered by useEffect [isLoggedIn]
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sanskritUserProgress");
    setProgress({
      xp: 0,
      completedLessons: [],
      unlockedLessons: ["LS001"],
    });
  };

  return (
    <UserProgressContext.Provider
      value={{
        progress,
        completeLesson,
        startGuestSession,
        loginUser,
        logoutUser,
        isLoggedIn,
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context)
    throw new Error("useUserProgress must be used within UserProgressProvider");
  return context;
};