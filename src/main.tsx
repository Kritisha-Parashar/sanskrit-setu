import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getTestSession, createTestSession } from "./lib/testSession";

if (!getTestSession()) {
  createTestSession();
}

createRoot(document.getElementById("root")!).render(<App />);
