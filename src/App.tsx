import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Eager-load the landing page for fastest initial render
import Home from "./pages/Home";

// Lazy-load all other pages for code splitting
const OurStory = lazy(() => import("./pages/OurStory"));
const WeddingParty = lazy(() => import("./pages/WeddingParty"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const Travel = lazy(() => import("./pages/Travel"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Registry = lazy(() => import("./pages/Registry"));
const RSVP = lazy(() => import("./pages/RSVP"));
const InviteRSVP = lazy(() => import("./pages/InviteRSVP"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Locked pages
const InteractiveTimeline = lazy(() => import("./pages/locked/InteractiveTimeline"));
const GuestQuiz = lazy(() => import("./pages/locked/GuestQuiz"));
const MessageWall = lazy(() => import("./pages/locked/MessageWall"));
const PhotoUpload = lazy(() => import("./pages/locked/PhotoUpload"));
const LiveUpdates = lazy(() => import("./pages/locked/LiveUpdates"));
const Gallery = lazy(() => import("./pages/locked/Gallery"));
const SecretPage = lazy(() => import("./pages/locked/SecretPage"));
const SeatingChart = lazy(() => import("./pages/locked/SeatingChart"));
const PhotoBooth = lazy(() => import("./pages/locked/PhotoBooth"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminVisualEditor = lazy(() => import("./pages/admin/AdminVisualEditor"));
const AdminGuestbook = lazy(() => import("./pages/admin/AdminGuestbook"));
const AdminPhotos = lazy(() => import("./pages/admin/AdminPhotos"));
const AdminRsvps = lazy(() => import("./pages/admin/AdminRSVPs"));
const AdminSongRequests = lazy(() => import("./pages/admin/AdminSongRequests"));
const AdminInvites = lazy(() => import("./pages/admin/AdminInvites"));
const AdminLockedPages = lazy(() => import("./pages/admin/AdminLockedPages"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground font-sans text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/wedding-party" element={<WeddingParty />} />
            <Route path="/event-details" element={<EventDetails />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/rsvp" element={<RSVP />} />
            {/* Locked Pages */}
            <Route path="/timeline" element={<InteractiveTimeline />} />
            <Route path="/quiz" element={<GuestQuiz />} />
            <Route path="/guestbook" element={<MessageWall />} />
            <Route path="/photos" element={<PhotoUpload />} />
            <Route path="/updates" element={<LiveUpdates />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/secret" element={<SecretPage />} />
            <Route path="/seating" element={<SeatingChart />} />
            <Route path="/photo-booth" element={<PhotoBooth />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/visual-editor" element={<AdminVisualEditor />} />
            <Route path="/admin/guestbook" element={<AdminGuestbook />} />
            <Route path="/admin/photos" element={<AdminPhotos />} />
            <Route path="/admin/rsvps" element={<AdminRsvps />} />
            <Route path="/admin/song-requests" element={<AdminSongRequests />} />
            <Route path="/admin/invites" element={<AdminInvites />} />
            <Route path="/admin/locked-pages" element={<AdminLockedPages />} />
            {/* Invite RSVP */}
            <Route path="/invite/:code" element={<InviteRSVP />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
