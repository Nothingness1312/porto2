import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Search, Terminal, Sun, Moon } from "lucide-react";

const NAV = [
  { to: "/about", label: "about" },
  { to: "/projects", label: "projects" },
  { to: "/writeups", label: "writeups" },
  { to: "/certificates", label: "certificates" },
  { to: "/contact", label: "contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "night">(
    () => (document.documentElement.dataset.theme as "light" | "night") || "light"
  );
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = theme === "light" ? "night" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("kk-theme", next);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b-2 border-ink bg-paper transition-shadow ${
        scrolled ? "shadow-hard-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2" aria-label="KKARINZZZ home">
          <span className="flex h-8 w-8 items-center justify-center rounded border-2 border-ink bg-night text-volt-cyan transition-transform group-hover:-rotate-6">
            <Terminal size={16} />
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-ink">
            KKARINZZZ<span className="animate-blink text-blaze">_</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded px-3 py-1.5 font-mono text-sm transition-colors ${
                  isActive
? "bg-night text-snow"
                    : "text-ink-soft hover:bg-paper-dark hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event("kk:open-palette"))}
            className="hidden md:flex items-center gap-2 rounded-md border-2 border-ink bg-paper-bright px-3 py-1.5 font-mono text-xs text-ink-soft shadow-hard-sm transition-all hover:-translate-y-0.5 hover:shadow-hard"
          >
            <Search size={13} />
            commands
            <kbd className="rounded border border-ink/25 px-1 text-[10px] text-ink-faint">⌘K</kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink bg-paper-bright text-ink shadow-hard-sm transition-all hover:-translate-y-0.5 hover:shadow-hard"
            aria-label={theme === "light" ? "Switch to night mode" : "Switch to light mode"}
            title={theme === "light" ? "night mode" : "light mode"}
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button
            className="flex items-center gap-2 md:hidden rounded-md border-2 border-ink bg-paper-bright px-2.5 py-1.5 font-mono text-xs text-ink shadow-hard-sm"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="border-t-2 border-ink bg-paper-bright md:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col p-2">
            <li>
              <Link to="/" className="block rounded px-4 py-3 font-mono text-sm text-ink hover:bg-paper-dark">
                home
              </Link>
            </li>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded px-4 py-3 font-mono text-sm ${
                      isActive ? "bg-night text-snow" : "text-ink-soft hover:bg-paper-dark"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}