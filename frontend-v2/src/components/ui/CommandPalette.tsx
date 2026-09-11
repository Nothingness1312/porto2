import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FolderGit2,
  FileText,
  User,
  Clock,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  Search,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: Command[] = useMemo(
    () => [
      { id: "home", label: "Go Home", icon: <Home size={16} />, action: () => navigate("/"), category: "navigation" },
      { id: "projects", label: "View Projects", icon: <FolderGit2 size={16} />, action: () => navigate("/projects"), category: "navigation" },
      { id: "writeups", label: "View Writeups", icon: <FileText size={16} />, action: () => navigate("/writeups"), category: "navigation" },
      { id: "about", label: "About", icon: <User size={16} />, action: () => navigate("/about"), category: "navigation" },
      { id: "experience", label: "Certificates", icon: <Clock size={16} />, action: () => navigate("/certificates"), category: "navigation" },
      { id: "contact", label: "Contact", icon: <Mail size={16} />, action: () => navigate("/contact"), category: "navigation" },
      { id: "github", label: "GitHub", icon: <Github size={16} />, action: () => window.open("https://github.com/kkarinzzz", "_blank"), category: "links" },
      { id: "linkedin", label: "LinkedIn", icon: <Linkedin size={16} />, action: () => window.open("https://linkedin.com/in/kkarinzzz", "_blank"), category: "links" },
    ],
    [navigate]
  );

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.category.includes(q)
    );
  }, [commands, query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setSelectedIdx(0);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    const onOpen = () => {
      setOpen(true);
      setQuery("");
      setSelectedIdx(0);
    };
    window.addEventListener("kk:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("kk:open-palette", onOpen);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const runCommand = (cmd: Command) => {
    cmd.action();
    setOpen(false);
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) runCommand(filtered[selectedIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Floating hint - clickable */}
      <button
        onClick={() => {
          setOpen(true);
          setQuery("");
          setSelectedIdx(0);
        }}
        className="fixed bottom-4 right-4 z-40 hidden md:flex items-center gap-2 rounded-md border-2 border-ink/20 bg-paper-bright px-3 py-1.5 font-mono text-xs text-ink-faint shadow-hard-sm transition-all hover:-translate-y-0.5 hover:shadow-hard"
      >
        <kbd className="inline-flex items-center justify-center rounded border border-ink/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold">⌘K</kbd>
        <span>search & navigate</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]"
            onClick={() => setOpen(false)}
          >
            {/* Solid backdrop - NO glassmorphism */}
            <div className="absolute inset-0 bg-ink/40" />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-lg border-2 border-ink bg-paper-bright shadow-hard overflow-hidden"
              role="dialog"
              aria-label="Command palette"
            >
              {/* Search bar */}
              <div className="flex items-center gap-3 border-b-2 border-ink/15 px-4 py-3">
                <Search size={16} className="text-ink-faint" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyNav}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent font-body text-ink outline-none placeholder:text-ink-faint"
                  aria-label="Search commands"
                />
                <kbd className="rounded border border-ink/20 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">esc</kbd>
              </div>

              {/* Results */}
              <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
                {filtered.length === 0 && (
                  <li className="px-4 py-6 text-center font-mono text-sm text-ink-faint">
                    No commands found
                  </li>
                )}
                {filtered.map((cmd, i) => (
                  <li
                    key={cmd.id}
                    role="option"
                    aria-selected={i === selectedIdx}
                    className={`flex items-center gap-3 rounded px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                      i === selectedIdx ? "bg-volt/10 text-ink" : "text-ink-soft hover:bg-paper-dark"
                    }`}
                    onClick={() => runCommand(cmd)}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <span className="text-ink-faint">{cmd.icon}</span>
                    <span className="flex-1 font-medium">{cmd.label}</span>
                    {cmd.id !== "home" && cmd.id !== "admin" && (
                      <ExternalLink size={12} className="text-ink-faint" />
                    )}
                  </li>
                ))}
              </ul>

              {/* Footer - Easter egg line */}
              <div className="border-t border-ink/10 bg-paper-dark px-4 py-2 font-mono text-[10px] text-ink-faint">
                all systems nominal - tilde for diagnostics
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}