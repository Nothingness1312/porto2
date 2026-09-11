import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";

interface Props {
  value: number;
  suffix?: string;
}

function AnimatedNumber({ value, suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (v: number) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export function AnimatedCounter({ value, suffix }: Props) {
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return <span>{value}{suffix ?? ""}</span>;
  return <AnimatedNumber value={value} suffix={suffix} />;
}