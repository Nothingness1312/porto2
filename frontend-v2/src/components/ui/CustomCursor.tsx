import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [onAdmin, setOnAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOnAdmin(location.pathname.startsWith("/admin"));
  }, [location.pathname]);

  useEffect(() => {
    if (onAdmin) return;
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHover(
        target.closest("a, button, [data-cursor]") !== null
      );
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [onAdmin, visible]);

  if (onAdmin) return null;
  if (!visible || typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 mix-blend-difference"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
    >
      {/* Small dot */}
      <div
        className="rounded-full bg-volt transition-all duration-150 ease-out"
        style={{
          width: isHover ? 12 : 8,
          height: isHover ? 12 : 8,
          marginLeft: isHover ? -4 : -2,
          marginTop: isHover ? -4 : -2,
        }}
      />
      {/* Trailing ring */}
      <div
        className="absolute rounded-full border-2 border-volt transition-all duration-300 ease-out"
        style={{
          width: isHover ? 36 : 32,
          height: isHover ? 36 : 32,
          left: "50%",
          top: "50%",
          marginLeft: isHover ? -18 : -16,
          marginTop: isHover ? -18 : -16,
          opacity: 0.5,
        }}
      />
    </div>
  );
}