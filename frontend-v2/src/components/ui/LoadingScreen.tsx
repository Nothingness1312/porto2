export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-[2px] w-40 overflow-hidden bg-paper-dark">
          <div className="absolute inset-0 animate-[scan_1.5s_ease-in-out_infinite] bg-volt" />
        </div>
        <p className="font-mono text-sm text-ink-soft">
          loading lab<span className="animate-blink ml-0.5">_</span>
        </p>
      </div>
    </div>
  );
}