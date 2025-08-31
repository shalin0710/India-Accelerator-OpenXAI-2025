"use client";
import { FiMoon, FiSun } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-3 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-lg
                 hover:shadow-xl transition-all duration-300 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative z-10">
        {theme === "dark" ? (
          <FiSun size={20} className="text-primary" />
        ) : (
          <FiMoon size={20} className="text-primary" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.button>
  );
}
