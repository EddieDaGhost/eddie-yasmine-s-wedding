import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";

import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/admin";
import AdminRsvps from "./pages/admin/rsvps";
import AdminGuestbook from "./pages/admin/guestbook";
import AdminPhotos from "./pages/admin/photos";
import AdminContent from "./pages/admin/content";

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

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Public Pages */}
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

            {/* Admin Dashboard (Protected) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminHome />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/rsvps"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminRsvps />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/guestbook"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminGuestbook />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/photos"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminPhotos />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/content"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminContent />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;