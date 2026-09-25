"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const cursorXSpring = useSpring(cursorX, { damping: 50, stiffness: 600 });
  const cursorYSpring = useSpring(cursorY, { damping: 50, stiffness: 600 });
  const glowXSpring = useSpring(cursorX, { damping: 30, stiffness: 100 });
  const glowYSpring = useSpring(cursorY, { damping: 30, stiffness: 100 });

  useEffect(() => {
    setIsMounted(true);
    // Disable on mobile/touch devices to prevent lag and weird touch bugs
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }
    setIsDesktop(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX); 
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY]);

  if (!isMounted || !isDesktop) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-12 w-12 rounded-full bg-primary/20 blur-md"
        style={{
          x: glowXSpring,
          y: glowYSpring,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
        }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
        }}
      />
    </>
  );
}
