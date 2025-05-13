import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import 'react-phone-input-2/lib/style.css';
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
