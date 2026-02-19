const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface AdminStats {
  totalUsers: number;
  totalLessons: number;
  totalPronunciationAttempts: number;
  averagePronunciationAccuracy: number;
  totalXP: number;
}

export interface LessonPerformance {
  lessonId: string;
  lessonNumber: number;
  title: string;
  completionRate: number;
  averagePronunciationAccuracy: number;
  completedCount: number;
  totalUsers: number;
}

export interface Lesson {
  lesson_id: string;
  lesson_number: number;
  title_sanskrit: string;
  title_english: string;
  difficulty_level: string;
  description: string;
}

export interface Slide {
  id?: number;
  lesson_id: number;
  lesson_slide_id: number;
  lesson_id_string: string;
  order_index: number;
  content_type: string;
  sanskrit: string;
  word: string;
  transliteration: string;
  meaning: string;
  example_meaning: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }

  return response.json();
};

export const getLessonPerformance = async (): Promise<LessonPerformance[]> => {
  const response = await fetch(`${API_URL}/admin/lesson-performance`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch lesson performance");
  }

  return response.json();
};

export const addLesson = async (lesson: {
  lessonId: string;
  lessonNumber: number;
  titleSanskrit: string;
  titleEnglish: string;
  difficultyLevel?: string;
  description?: string;
}): Promise<Lesson> => {
  const response = await fetch(`${API_URL}/admin/lessons`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(lesson),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add lesson");
  }

  const data = await response.json();
  return data.lesson;
};

export const addSlide = async (
  lessonId: string,
  slide: {
    lessonSlideId: number;
    lessonIdString?: string;
    orderIndex: number;
    contentType?: string;
    sanskrit: string;
    word: string;
    transliteration: string;
    meaning: string;
    exampleMeaning: string;
  }
): Promise<Slide> => {
  const response = await fetch(`${API_URL}/admin/lessons/${lessonId}/slides`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(slide),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add slide");
  }

  const data = await response.json();
  return data.slide;
};

export const getAllLessons = async (): Promise<Lesson[]> => {
  const response = await fetch(`${API_URL}/admin/lessons`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch lessons");
  }

  const data = await response.json();
  return data.lessons;
};

export const getLessonSlides = async (lessonId: string): Promise<Slide[]> => {
  const response = await fetch(`${API_URL}/admin/lessons/${lessonId}/slides`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch slides");
  }

  const data = await response.json();
  return data.slides;
};

export const updateLessonXP = async (lessonId: string, xp: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/lessons/${lessonId}/xp`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ xp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update lesson XP");
  }
};
