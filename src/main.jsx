// src/main.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, useTheme } from "./context/ThemeContext"; // ✅ Theme
import { SearchProvider } from "./context/SearchContext";
import "./index.css";

// ⬇️ Wrapper to sync theme class on <html>
const ThemeWrapper = ({ children }) => {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return children;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeWrapper>
        <SearchProvider>
          <App />
        </SearchProvider>
      </ThemeWrapper>
    </ThemeProvider>
  </React.StrictMode>
);