const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    role: "student" | "admin";
  };
}

export const signup = async (
  email: string,
  password: string,
  name?: string,
  username?: string,
  role?: "student" | "admin"
): Promise<AuthResponse> => {
  try {
    console.log("Signup request to:", `${API_URL}/auth/signup`);
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name, username, role }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("Signup failed:", errorData);
      throw new Error(errorData.error || "Signup failed");
    }

    const responseData = await response.json();
    console.log("Signup successful:", responseData);
    
    // Don't store token/user - user needs to login explicitly after signup
    // This ensures they verify their credentials before accessing the app
    
    return responseData;
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Could not connect to server. Make sure the server is running on port 5000.");
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log("Login request to:", `${API_URL}/auth/login`);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error("Login failed:", errorData);
      throw new Error(errorData.error || "Login failed");
    }

    const responseData = await response.json();
    console.log("Login successful:", responseData);
    
    // Store token in localStorage
    localStorage.setItem("authToken", responseData.token);
    localStorage.setItem("user", JSON.stringify(responseData.user));
    
    return responseData;
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.message) {
      throw error;
    }
    throw new Error("Network error: Could not connect to server. Make sure the server is running on port 5000.");
  }
};

export const logout = async (): Promise<void> => {
  const token = localStorage.getItem("authToken");
  
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  
  // Remove token and user from localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = async (): Promise<AuthResponse["user"] | null> => {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token is invalid, clear it
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const getStoredUser = (): AuthResponse["user"] | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthResponse["user"];
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("authToken");
};

export const isAdmin = (): boolean => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user.role === "admin";
  } catch {
    return false;
  }
};

export const getCurrentUserRole = (): "student" | "admin" | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.role || "student";
  } catch {
    return null;
  }
};

// Progress API functions
export interface UserProgress {
  xp: number;
  completedLessons: string[];
  unlockedLessons: string[];
}

export const getProgress = async (): Promise<UserProgress | null> => {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/progress`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to get progress:", response.status);
      return null;
    }

    const data = await response.json();
    return {
      xp: data.xp,
      completedLessons: data.completedLessons,
      unlockedLessons: data.unlockedLessons,
    };
  } catch (error) {
    console.error("Get progress error:", error);
    return null;
  }
};

export const updateProgress = async (progress: UserProgress): Promise<boolean> => {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/progress`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(progress),
    });

    if (!response.ok) {
      console.error("Failed to update progress:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Update progress error:", error);
    return false;
  }
};

export const resetProgress = async (): Promise<boolean> => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  try {
    const response = await fetch(`${API_URL}/progress/reset`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error("Failed to reset progress:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Reset progress error:", error);
    return false;
  }
};
