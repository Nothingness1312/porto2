import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { CustomCursor } from "../ui/CustomCursor";

export function Layout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <CustomCursor />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}