import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm text-blaze">404 - segment fault</p>
      <h1 className="display-xl mt-4">
        <span className="font-mono text-volt">0x</span>dead
        <span className="animate-blink text-blaze">_</span>
      </h1>
      <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
        The page you're looking for doesn't exist. Either the URL is wrong, or the pointer was never initialized.
      </p>
      <div className="mt-8 rounded-lg border-2 border-ink bg-paper-dark px-6 py-4 font-mono text-sm text-ink-soft">
        <p className="text-left">
          <span className="text-ink-faint">$ </span>segfault_handler -fix
        </p>
        <p className="mt-1 text-left">
          <span className="text-ink-faint">$ </span>found null - returning to home...
        </p>
      </div>
      <Link to="/" className="btn-hard mt-8">
        back to /root
      </Link>
    </div>
  );
}