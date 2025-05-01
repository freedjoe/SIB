import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

// React 19 recommended approach - error handling is improved
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
