import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
      className={`
        relative h-8 w-16 rounded-full p-1 transition-colors duration-200
        ${theme === "light" ? "bg-[#e2e2ea]" : "bg-[#1C1C28]"}
      `}
    >
      <div
        className={`
          absolute top-1 left-1 h-6 w-6 rounded-full
          transform transition-transform duration-200 ease-out
          ${theme === "light" ? "translate-x-0 bg-[#FFB020]" : "translate-x-6 bg-[#7664FF]"}
          flex items-center justify-center
        `}
      >
        {theme === "light" ? <Sun className="h-4 w-4 text-white" /> : <Moon className="h-4 w-4 text-white" />}
      </div>
    </button>
  );
}
