import { User } from "../types/user";

const TEST_USER_KEY = "test_user";

export const createTestSession = (): User => {
  const user: User = {
    id: "test-user-001",
    name: "Test User",
    email: "test@sanskritsetu.dev",
    role: "student",
  };

  localStorage.setItem(TEST_USER_KEY, JSON.stringify(user));
  return user;
};

export const getTestSession = (): User | null => {
  const data = localStorage.getItem(TEST_USER_KEY);
  return data ? (JSON.parse(data) as User) : null;
};

export const clearTestSession = (): void => {
  localStorage.removeItem(TEST_USER_KEY);
};
