import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import Navbar from "@/components/Navbar";
import MusicPlayer from "@/components/MusicPlayer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LibraryPage from "@/pages/library";
import TrendingPage from "@/pages/trending";
import MixtapePage from "@/pages/mixtape";
import SongPage from "@/pages/song";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUploadPage from "@/pages/admin/upload";
import AdminSongsPage from "@/pages/admin/songs";
import AdminMixtapesPage from "@/pages/admin/mixtapes";
import AdminCommentsPage from "@/pages/admin/comments";
import AdminAnalyticsPage from "@/pages/admin/analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAdmin();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <Component />;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <MusicPlayer />
    </>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <Switch>
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/upload">
        {() => <ProtectedRoute component={AdminUploadPage} />}
      </Route>
      <Route path="/admin/songs">
        {() => <ProtectedRoute component={AdminSongsPage} />}
      </Route>
      <Route path="/admin/mixtapes">
        {() => <ProtectedRoute component={AdminMixtapesPage} />}
      </Route>
      <Route path="/admin/comments">
        {() => <ProtectedRoute component={AdminCommentsPage} />}
      </Route>
      <Route path="/admin/analytics">
        {() => <ProtectedRoute component={AdminAnalyticsPage} />}
      </Route>
      <Route path="/">
        {() => <PublicLayout><HomePage /></PublicLayout>}
      </Route>
      <Route path="/library">
        {() => <PublicLayout><LibraryPage /></PublicLayout>}
      </Route>
      <Route path="/trending">
        {() => <PublicLayout><TrendingPage /></PublicLayout>}
      </Route>
      <Route path="/mixtapes/:id">
        {() => <PublicLayout><MixtapePage /></PublicLayout>}
      </Route>
      <Route path="/songs/:id">
        {() => <PublicLayout><SongPage /></PublicLayout>}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AdminProvider>
              <Router />
            </AdminProvider>
          </WouterRouter>
        </PlayerProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
