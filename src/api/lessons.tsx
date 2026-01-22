export const getLessons = async () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const res = await fetch(`${API_URL}/lessons`);
  if (!res.ok) throw new Error("Failed to fetch lessons");
  return res.json();
};
