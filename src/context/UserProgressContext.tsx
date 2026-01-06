import React, { createContext, useContext, useState, useEffect } from "react";

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
  // 1. Check if we are in "User Mode" (Logged in)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // 2. Initialize Progress
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (isLoggedIn) {
      // If logged in, try to load saved data
      const saved = localStorage.getItem("sanskritUserProgress");
      return saved ? JSON.parse(saved) : { xp: 0, completedLessons: [], unlockedLessons: [1] };
    } else {
      // If guest, ALWAYS start fresh (Memory only)
      return { xp: 0, completedLessons: [], unlockedLessons: [1] };
    }
  });

  // 3. Save to LocalStorage ONLY if Logged In
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("sanskritUserProgress", JSON.stringify(progress));
    }
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
  const loginUser = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true"); // Set persistent flag
    // Try to restore old data if it exists
    const saved = localStorage.getItem("sanskritUserProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
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