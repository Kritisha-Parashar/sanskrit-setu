import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  refreshProgress: () => Promise<void>; // Added this to fix red lines
  isLoggedIn: boolean;
}

const DEFAULT_PROGRESS: UserProgress = { 
  xp: 0, 
  completedLessons: [], 
  unlockedLessons: ["LS001"] 
};

/* ---------------- CONTEXT ---------------- */
const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

/* ---------------- PROVIDER ---------------- */
export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());

  // Monitor auth token changes
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      if (authenticated !== isLoggedIn) {
        setIsLoggedIn(authenticated);
      }
    };
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // 2. Initialize Progress
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  // 3. API Sync Function (refreshProgress)
  const refreshProgress = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const apiProgress = await getProgress();
        if (apiProgress) {
          const normalizedProgress: UserProgress = {
            xp: apiProgress.xp || 0,
            completedLessons: (apiProgress.completedLessons || []).map(String),
            unlockedLessons: (apiProgress.unlockedLessons || []).length > 0 
              ? apiProgress.unlockedLessons.map(String) 
              : ["LS001"],
          };
          if (!normalizedProgress.unlockedLessons.includes('LS001')) {
            normalizedProgress.unlockedLessons.unshift('LS001');
          }
          setProgress(normalizedProgress);
        }
      } catch (error) {
        console.error("Failed to load progress from API:", error);
      }
    }
  }, [isLoggedIn]);

  // Trigger load on login
  useEffect(() => {
    if (isLoggedIn) {
      refreshProgress();
    } else {
      // If not logged in, force reset to prevent "Ghost Data"
      setProgress(DEFAULT_PROGRESS);
    }
  }, [isLoggedIn, refreshProgress]);

  // 4. Auto-Save to API/Local
  useEffect(() => {
    if (isLoggedIn && progress.xp > 0 || progress.completedLessons.length > 0) {
      const saveProgress = async () => {
        try {
          await updateProgress(progress);
          localStorage.setItem("sanskritUserProgress", JSON.stringify(progress));
        } catch (error) {
          console.error("Error saving progress:", error);
        }
      };
      const timeoutId = setTimeout(saveProgress, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [progress, isLoggedIn]);

  /* ---------------- HANDLERS ---------------- */

  const completeLesson = (lessonId: string, score: number, orderedLessonIds: string[]) => {
    if (score < 75) return;
    setProgress((prev) => {
      const isReplay = prev.completedLessons.includes(lessonId);
      const xpGained = isReplay ? 0 : 50;
      const currentIndex = orderedLessonIds.indexOf(lessonId);
      const nextLessonId = orderedLessonIds[currentIndex + 1];

      const newUnlockedLessons = nextLessonId && !prev.unlockedLessons.includes(nextLessonId)
        ? [...prev.unlockedLessons, nextLessonId]
        : prev.unlockedLessons;

      return {
        xp: prev.xp + xpGained,
        completedLessons: isReplay ? prev.completedLessons : [...prev.completedLessons, lessonId],
        unlockedLessons: newUnlockedLessons,
      };
    });
  };

  const startGuestSession = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    setProgress(DEFAULT_PROGRESS);
  };

  const loginUser = () => {
    setIsLoggedIn(true);
  };

  const logoutUser = () => {
    localStorage.clear(); // Nukes everything
    sessionStorage.clear();
    setIsLoggedIn(false);
    setProgress(DEFAULT_PROGRESS); // Hard reset state
  };

  return (
    <UserProgressContext.Provider
      value={{
        progress,
        completeLesson,
        startGuestSession,
        loginUser,
        logoutUser,
        refreshProgress, // Now provided to all pages
        isLoggedIn,
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) throw new Error("useUserProgress must be used within UserProgressProvider");
  return context;
};