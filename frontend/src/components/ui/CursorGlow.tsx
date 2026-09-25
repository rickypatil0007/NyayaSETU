"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const [isMounted, setIsMounted] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const cursorXSpring = useSpring(cursorX, { damping: 50, stiffness: 600 });
  const cursorYSpring = useSpring(cursorY, { damping: 50, stiffness: 600 });

  // Generate 15 trailing dots for a clean, continuous line strike
  const trailConfigs = Array.from({ length: 15 }).map((_, i) => {
    const factor = i / 14; 
    return {
      damping: 40 - factor * 25,     // from 40 down to 15
      stiffness: 400 - factor * 350, // from 400 down to 50
      size: 6 - factor * 5,          // from 6px to 1px
      opacity: 0.9 - factor * 0.8    // from 0.9 to 0.1
    };
  });

  const trails = trailConfigs.map(t => ({
    x: useSpring(cursorX, { damping: t.damping, stiffness: t.stiffness }),
    y: useSpring(cursorY, { damping: t.damping, stiffness: t.stiffness }),
    size: t.size,
    opacity: t.opacity
  }));

  // Faint Glow (Larger, Slower, Fainter)
  const glowXSpring = useSpring(cursorX, { damping: 30, stiffness: 80 });
  const glowYSpring = useSpring(cursorY, { damping: 30, stiffness: 80 });

  useEffect(() => {
    setIsMounted(true);
    const moveCursor = (e: MouseEvent) => {
      // Set to exact center, we will use translateX/Y -50% to center it
      cursorX.set(e.clientX); 
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY]);

  if (!isMounted) return null;

  return (
    <>
      {/* Streak / Trails */}
      {trails.map((trail, index) => (
        <motion.div
          key={index}
          className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]"
          style={{
            x: trail.x,
            y: trail.y,
            width: trail.size,
            height: trail.size,
            opacity: trail.opacity,
            translateX: "-50%",
            translateY: "-50%",
            willChange: "transform",
          }}
        />
      ))}

      {/* Main Cursor Dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[10px] w-[10px] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          background: "rgba(255, 255, 255, 1)",
          willChange: "transform",
        }}
      />
    </>
  );
}
