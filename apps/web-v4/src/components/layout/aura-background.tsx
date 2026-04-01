"use client";

import { motion } from "framer-motion";

export function AuraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      {/* Primary Aura - Violet */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "-10%",
          left: "-5%",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary Aura - Cyan */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          bottom: "-5%",
          right: "-5%",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Tertiary Aura - Pink (subtle) */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)",
          filter: "blur(100px)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(15, 23, 42, 0.06) 100%)",
        }}
      />
    </div>
  );
}
