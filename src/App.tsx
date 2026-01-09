import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import OurStory from "./pages/OurStory";
import WeddingParty from "./pages/WeddingParty";
import EventDetails from "./pages/EventDetails";
import Travel from "./pages/Travel";
import FAQ from "./pages/FAQ";
import Registry from "./pages/Registry";
import RSVP from "./pages/RSVP";

import InteractiveTimeline from "./pages/locked/InteractiveTimeline";
import GuestQuiz from "./pages/locked/GuestQuiz";
import MessageWall from "./pages/locked/MessageWall";
import PhotoUpload from "./pages/locked/PhotoUpload";
import LiveUpdates from "./pages/locked/LiveUpdates";
import Gallery from "./pages/locked/Gallery";
import SecretPage from "./pages/locked/SecretPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminVisualEditor from "./pages/admin/AdminVisualEditor";
import AdminGuestbook from "./pages/admin/AdminGuestbook";
import AdminPhotos from "./pages/admin/AdminPhotos";
import AdminRsvps from "./pages/admin/AdminRSVPs";
import AdminSongRequests from "./pages/admin/AdminSongRequests";
import AdminInvites from "./pages/admin/AdminInvites";
import AdminLockedPages from "./pages/admin/AdminLockedPages";
import InviteRSVP from "./pages/InviteRSVP";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;