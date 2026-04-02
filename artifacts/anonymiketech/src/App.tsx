import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IntroLoader } from "@/components/ui/intro-loader";
import { MaintenanceGate } from "@/components/maintenance-gate";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import BotsPage from "@/pages/bots";
import PartnersPage from "@/pages/partners";
import ProfilePage from "@/pages/profile";
import PricingPage from "@/pages/pricing";
import ContactPage from "@/pages/contact";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <MaintenanceGate>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Landing} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/contact" component={ContactPage} />

          {/* Protected routes — require login */}
          <Route path="/dashboard">
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          </Route>
          <Route path="/bots">
            <ProtectedRoute><BotsPage /></ProtectedRoute>
          </Route>
          <Route path="/partners">
            <ProtectedRoute><PartnersPage /></ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          </Route>

          {/* Admin — protected separately on the admin page itself */}
          <Route path="/1admin1" component={AdminPage} />

          <Route component={NotFound} />
        </Switch>
      </MaintenanceGate>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IntroLoader />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
