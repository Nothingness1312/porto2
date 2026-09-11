import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";

interface Props {
  children: ReactNode;
  strength?: number;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}

export function MagneticButton({ children, strength = 0.15, className = "", ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { mass: 0.5, stiffness: 200, damping: 20 });
  const springY = useSpring(y, { mass: 0.5, stiffness: 200, damping: 20 });

  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMouseMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (prefersReduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`btn-hard ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}