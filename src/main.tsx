import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BaseProvider } from "./providers/BaseProvider";

createRoot(document.getElementById("root")!).render(
  <BaseProvider>
    <App />
  </BaseProvider>
);
