"use client";

import { motion } from "framer-motion";

export default function MotionBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ willChange: "transform" }}>
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(0,0,0,0) 70%)",
          willChange: "transform",
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(0,0,0,0) 70%)",
          willChange: "transform",
        }}
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -100, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
