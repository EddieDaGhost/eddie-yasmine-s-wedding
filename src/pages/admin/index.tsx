import { useAdminStats } from "@/hooks/useAdminStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AdminHome() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return <p className="p-6 text-lg">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <p className="p-6 text-red-500">
        Failed to load stats. Please try again.
      </p>
    );
  }

  const { rsvps, guestbook, photos } = data;

  return (
    <div className="p-6 space-y-10">
      {/* Dashboard Header */}
      <header className="space-y-1">
        <h1 className="text-4xl font-display">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of guest activity, RSVPs, and content moderation.
        </p>
      </header>

      {/* RSVP Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">RSVP Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total RSVPs" value={rsvps.total} />
          <StatCard label="Attending" value={rsvps.attending} />
          <StatCard label="Not Attending" value={rsvps.notAttending} />
          <StatCard label="No Response" value={rsvps.noResponse} />
          <StatCard
            label="Meal Choices"
            value={Object.values(rsvps.mealChoices).reduce((a, b) => a + b, 0)}
          />
          <StatCard label="Allergies" value={rsvps.allergies} />
        </div>
      </section>

      {/* Guestbook Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Guestbook Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Messages" value={guestbook.total} />
          <StatCard label="Unread" value={guestbook.unread} />
          <StatCard label="Approved" value={guestbook.approved} />
        </div>
      </section>

      {/* Photo Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Photo Uploads</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Photos" value={photos.total} />
          <StatCard label="Pending" value={photos.pending} />
          <StatCard label="Approved" value={photos.approved} />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction to="/admin/rsvps" label="Manage RSVPs" />
          <QuickAction to="/admin/guestbook" label="Review Guestbook" />
          <QuickAction to="/admin/photos" label="Moderate Photos" />
          <QuickAction to="/admin/content" label="Edit Content" />
        </div>
      </section>

      {/* Activity Feed Placeholder (future upgrade) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Activity</h2>
        <Card className="border border-border/50">
          <CardContent className="p-6 text-muted-foreground">
            Activity feed coming soon — RSVPs, messages, and uploads will appear here.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value ?? 0}</p>
      </CardContent>
    </Card>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to}>
      <Button variant="outline" className="w-full h-20 text-lg font-medium">
        {label}
      </Button>
    </Link>
  );
}
