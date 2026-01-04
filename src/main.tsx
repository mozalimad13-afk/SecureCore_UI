import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply dark class to html element by default before React renders
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
