import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IntroLoader } from "@/components/ui/intro-loader";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import BotsPage from "@/pages/bots";
import PartnersPage from "@/pages/partners";
import ProfilePage from "@/pages/profile";
import PricingPage from "@/pages/pricing";
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
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/bots" component={BotsPage} />
        <Route path="/partners" component={PartnersPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/pricing" component={PricingPage} />
        <Route component={NotFound} />
      </Switch>
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
