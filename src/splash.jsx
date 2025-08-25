import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Splash() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(() => {
            setVisible(false);
          }, 450);
          return 100;
        }
        return next;
      });
    }, 220);

    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
        >
          <div className="w-full max-w-sm mx-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center gap-4">
            <motion.div
              initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
                className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="4" fill="white" fillOpacity="0.12" />
                  <path d="M7 12h10M7 8h10M7 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>

              <div className="flex flex-col text-left">
                <div className="text-white font-semibold text-lg leading-tight">EduTask</div>
                <div className="text-white/80 text-sm">Memuat aplikasi...</div>
              </div>
            </motion.div>

            <div className="w-full flex flex-col items-center gap-3 mt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-white/25 border-t-white animate-spin" />
                <motion.div
                  animate={{ scale: [0.9, 1.15, 0.95] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute w-3 h-3 rounded-full bg-white"
                />
              </div>

              <div className="w-full mt-2">
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/80"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.35 }}
                  />
                </div>
                <div className="w-full flex items-center justify-between mt-2 text-xs text-white/90">
                  <div>Memuat EduTask....</div>
                  <div>{progress}%</div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-white/60 mt-2">Modern Loader • Animasi Halus</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
