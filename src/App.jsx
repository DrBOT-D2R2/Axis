import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // Animation Lib
import Sidebar from "./components/Sidebar";
import { useSettings } from "./hooks/useSettings";

// Pages
import Home from "./pages/home";
import Timetable from "./pages/timetable";
import Gym from "./pages/gym";
import Expenses from "./pages/expenses";
import Settings from "./pages/settings";

// Animated Page Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="h-full"
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/timetable" element={<PageTransition><Timetable /></PageTransition>} />
        <Route path="/gym" element={<PageTransition><Gym /></PageTransition>} />
        <Route path="/expenses" element={<PageTransition><Expenses /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // ... inside App component ...
  const { settings } = useSettings();

  useEffect(() => {
    // 1. Reset classes
    document.body.className = "";
    
    // 2. Apply theme (Graphite is default/root, others are classes)
    if (settings.theme !== 'graphite') {
      document.body.classList.add(`theme-${settings.theme}`);
    }
  }, [settings.theme]);
// ...
  return (
    <BrowserRouter>
      <div className="bg-app-bg text-app-text min-h-screen font-sans selection:bg-app-accent selection:text-white">
        <Sidebar>
          <AnimatedRoutes />
        </Sidebar>
      </div>
    </BrowserRouter>
  );
}

export default App;