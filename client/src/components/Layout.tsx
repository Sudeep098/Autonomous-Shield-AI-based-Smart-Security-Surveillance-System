import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { TacticalCursor } from "./TacticalCursor";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fixedHeight?: boolean; // If true, pins the layout to 100vh (for Maps/Monitoring)
}

export function Layout({ children, className, fixedHeight = false }: LayoutProps) {
  return (
    <div className={cn(
      "flex w-full bg-black font-sans selection:bg-green-500/30",
      fixedHeight ? "h-screen overflow-hidden" : "min-h-screen"
    )}>

      {/* Sidebar relative to sit on top of map */}
      {/* <TacticalCursor /> */}
      <div className={cn(
        "relative z-20",
        fixedHeight ? "h-full" : "sticky top-0 h-screen"
      )}>
        <Sidebar />
      </div>

      <main className={cn(
        "flex-1 flex flex-col min-w-0 relative z-10 bg-zinc-950",
        fixedHeight ? "overflow-hidden" : ""
      )}>
        {/* EXTREME UI LAYERS REMOVED FOR CLARITY */}

        {/* Top HUD Line */}
        <div className="h-[1px] bg-white/5 w-full shrink-0" />

        <div className={cn(
          "flex-1",
          fixedHeight ? "overflow-auto p-4 md:p-8 custom-scrollbar" : "p-4 md:p-8",
          className
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
