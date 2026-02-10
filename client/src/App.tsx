import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { useState, Suspense, lazy } from "react";
import { BootLoader } from "@/components/BootLoader";
import { ThemeProvider } from "@/components/theme-provider";

// Lazy load surveillance components

const Alerts = lazy(() => import("@/pages/Alerts"));
const ThreatAlerts = lazy(() => import("@/pages/ThreatAlerts"));
const Suspects = lazy(() => import("@/pages/Suspects"));
const Devices = lazy(() => import("@/pages/Devices"));
const Logs = lazy(() => import("@/pages/Logs"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Playback = lazy(() => import("@/pages/Playback"));
const AutonomousShield = lazy(() => import("@/pages/AutonomousShield"));
const Tactical3D = lazy(() => import("@/pages/Tactical3D"));
const NeuralAnalytics = lazy(() => import("@/pages/NeuralAnalytics"));

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<BootLoader />}>
        <Switch location={location} key={location}>
          {/* PRIMARY SYSTEM - Kashmir Surveillance (Default) */}
          <Route path="/" component={AutonomousShield} />
          <Route path="/system" component={AutonomousShield} />

          <Route path="/tactical" component={Tactical3D} />
          <Route path="/analytics" component={NeuralAnalytics} />

          {/* Surveillance Modules */}
          <Route path="/threats" component={ThreatAlerts} />
          <Route path="/suspects" component={Suspects} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/playback" component={Playback} />
          <Route path="/logs" component={Logs} />

          {/* System Management */}
          <Route path="/devices" component={Devices} />
          <Route path="/settings" component={Settings} />

          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  const [booted, setBooted] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SmoothScroll>
          <TooltipProvider>
            <Toaster />
            <AnimatePresence>
              {!booted && <BootLoader onComplete={() => setBooted(true)} />}
            </AnimatePresence>
            {booted && <Router />}
          </TooltipProvider>
        </SmoothScroll>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
