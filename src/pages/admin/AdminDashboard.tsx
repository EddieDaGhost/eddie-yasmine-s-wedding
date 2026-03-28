import { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, Image, Music, CheckCircle, XCircle,
  Clock, Camera, Heart, TrendingUp, ArrowRight,
  Loader2, UtensilsCrossed, AlertCircle, Palette, Mail,
  FileText, Lock, CalendarDays, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminStats } from '@/hooks/useAdminStats';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/csv';
import { useToast } from '@/hooks/use-toast';

/* ------------------------------------------------------------------ */
/*  Wedding countdown                                                  */
/* ------------------------------------------------------------------ */

const WEDDING_DATE = new Date('2027-07-02T16:00:00');

function getDaysUntilWedding(): number {
  const now = new Date();
  const diff = WEDDING_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/* ------------------------------------------------------------------ */
/*  Recent activity types                                              */
/* ------------------------------------------------------------------ */

interface ActivityItem {
  id: string;
  type: 'rsvp' | 'photo' | 'message' | 'song';
  label: string;
  detail: string;
  time: string;
}

/* ------------------------------------------------------------------ */
/*  Stat card component                                                */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  to?: string;
  delay?: number;
}

const StatCard = ({ label, value, icon, color, bgColor, to, delay = 0 }: StatCardProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        'bg-card border border-border rounded-xl p-5 transition-shadow',
        to && 'hover:shadow-md cursor-pointer'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-2.5 rounded-lg', bgColor)}>{icon}</div>
        {to && <ArrowRight className="w-4 h-4 text-muted-foreground/40" />}
      </div>
      <p className={cn('text-3xl font-display', color)}>{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

/* ------------------------------------------------------------------ */
/*  Ring / donut chart (pure CSS)                                      */
/* ------------------------------------------------------------------ */

interface RingSegment {
  label: string;
  value: number;
  color: string;
}

const RingChart = ({ segments, total }: { segments: RingSegment[]; total: number }) => {
  const safeDivisor = total || 1;
  let cumulativePercent = 0;
  const gradientParts = segments.map((seg) => {
    const start = cumulativePercent;
    const pct = (seg.value / safeDivisor) * 100;
    cumulativePercent += pct;
    return `${seg.color} ${start}% ${cumulativePercent}%`;
  });
  // Fill remaining with muted
  if (cumulativePercent < 100) {
    gradientParts.push(`hsl(var(--muted)) ${cumulativePercent}% 100%`);
  }

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-28 h-28 rounded-full flex-shrink-0 relative"
        style={{
          background: `conic-gradient(${gradientParts.join(', ')})`,
        }}
      >
        <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
          <span className="text-2xl font-display text-foreground">{total}</span>
        </div>
      </div>
      <div className="space-y-2 min-w-0">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground truncate">{seg.label}</span>
            <span className="font-medium text-foreground ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Progress bar for meal breakdown                                    */
/* ------------------------------------------------------------------ */

const MealBar = ({ label, count, total }: { label: string; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{count}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Quick action link card                                             */
/* ------------------------------------------------------------------ */

const QuickAction = ({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
  >
    <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
      {icon}
    </div>
    <span className="font-medium text-sm text-foreground">{label}</span>
    {badge != null && badge > 0 && (
      <span className="ml-auto px-2 py-0.5 bg-primary/15 text-primary text-xs font-medium rounded-full">
        {badge}
      </span>
    )}
    <ArrowRight className="w-4 h-4 text-muted-foreground/40 ml-auto group-hover:translate-x-0.5 transition-transform" />
  </Link>
);

/* ------------------------------------------------------------------ */
/*  Activity icon helper                                               */
/* ------------------------------------------------------------------ */

const activityMeta: Record<ActivityItem['type'], { icon: React.ReactNode; color: string }> = {
  rsvp: { icon: <Users className="w-4 h-4" />, color: 'bg-primary/10 text-primary' },
  photo: { icon: <Camera className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-500' },
  message: { icon: <MessageSquare className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-500' },
  song: { icon: <Music className="w-4 h-4" />, color: 'bg-green-500/10 text-green-500' },
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const AdminDashboard = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { toast } = useToast();

  const handleExportRSVPs = useCallback(async () => {
    const { data } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false });
    if (!data || data.length === 0) {
      toast({ title: 'No RSVPs to export', variant: 'destructive' });
      return;
    }
    const headers = ['Name', 'Email', 'Attending', 'Guests', 'Meal Preference', 'Song Requests', 'Message', 'Invite Code', 'Date'];
    const rows = data.map((r) => [
      r.name || '',
      r.email || '',
      r.attending === true ? 'Yes' : r.attending === false ? 'No' : 'Pending',
      r.guests ?? 1,
      r.meal_preference || '',
      r.song_requests || '',
      r.message || '',
      r.invite_code || '',
      new Date(r.created_at).toLocaleDateString(),
    ]);
    exportToCSV(headers, rows, `rsvps-${format(new Date(), 'yyyy-MM-dd')}`);
    toast({ title: 'RSVPs exported!' });
  }, [toast]);

  // Fetch recent activity: latest RSVPs, messages, photos, song requests in parallel
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const [rsvpRes, msgRes, photoRes, songRes] = await Promise.all([
        supabase.from('rsvps').select('id, name, attending, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('messages').select('id, content, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('photos').select('id, caption, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('song_requests').select('id, title, artist, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const items: ActivityItem[] = [];

      rsvpRes.data?.forEach((r) => items.push({
        id: `rsvp-${r.id}`,
        type: 'rsvp',
        label: r.name || 'Guest',
        detail: r.attending === true ? 'RSVP\'d attending' : r.attending === false ? 'RSVP\'d not attending' : 'RSVP\'d (pending)',
        time: r.created_at,
      }));

      msgRes.data?.forEach((m) => items.push({
        id: `msg-${m.id}`,
        type: 'message',
        label: 'New message',
        detail: m.content?.substring(0, 60) || 'No content',
        time: m.created_at,
      }));

      photoRes.data?.forEach((p) => items.push({
        id: `photo-${p.id}`,
        type: 'photo',
        label: 'Photo uploaded',
        detail: p.caption?.substring(0, 60) || 'No caption',
        time: p.created_at,
      }));

      songRes.data?.forEach((s) => items.push({
        id: `song-${s.id}`,
        type: 'song',
        label: s.title || 'Song request',
        detail: s.artist ? `by ${s.artist}` : 'Unknown artist',
        time: s.created_at,
      }));

      return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
    },
    refetchOnWindowFocus: true,
  });

  // Fetch total guest headcount (attendees + their plus-ones)
  const { data: headcount } = useQuery({
    queryKey: ['admin-headcount'],
    queryFn: async () => {
      const { data } = await supabase
        .from('rsvps')
        .select('guests')
        .eq('attending', true);
      return (data || []).reduce((sum, r) => sum + 1 + (r.guests || 0), 0);
    },
    refetchOnWindowFocus: true,
  });

  // Derived stats
  const rsvpSegments: RingSegment[] = useMemo(() => {
    if (!stats?.rsvps) return [];
    return [
      { label: 'Attending', value: stats.rsvps.attending ?? 0, color: 'hsl(142 71% 45%)' },
      { label: 'Declined', value: stats.rsvps.notAttending ?? 0, color: 'hsl(0 84% 60%)' },
      { label: 'Pending', value: stats.rsvps.noResponse ?? 0, color: 'hsl(38 92% 50%)' },
    ];
  }, [stats?.rsvps]);

  const mealEntries = useMemo(() => {
    if (!stats?.rsvps?.mealChoices) return [];
    return Object.entries(stats.rsvps.mealChoices).sort((a, b) => b[1] - a[1]);
  }, [stats?.rsvps?.mealChoices]);

  const mealTotal = useMemo(
    () => mealEntries.reduce((sum, [, count]) => sum + count, 0),
    [mealEntries]
  );

  const daysLeft = getDaysUntilWedding();

  const pendingCount = useMemo(
    () => (stats?.guestbook?.pending ?? 0) + (stats?.photos?.pending ?? 0),
    [stats?.guestbook?.pending, stats?.photos?.pending]
  );

  // Loading / auth guard
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout onLogout={logout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your wedding at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {pendingCount} pending review
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <CalendarDays className="w-4 h-4" />
            {daysLeft > 0 ? `${daysLeft} days to go` : 'Wedding day!'}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[120px] bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total RSVPs"
            value={stats?.rsvps.total ?? 0}
            icon={<Users className="w-5 h-5 text-primary" />}
            color="text-primary"
            bgColor="bg-primary/10"
            to="/admin/rsvps"
            delay={0}
          />
          <StatCard
            label="Attending"
            value={stats?.rsvps.attending ?? 0}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            color="text-green-500"
            bgColor="bg-green-500/10"
            to="/admin/rsvps"
            delay={0.05}
          />
          <StatCard
            label="Declined"
            value={stats?.rsvps.notAttending ?? 0}
            icon={<XCircle className="w-5 h-5 text-red-500" />}
            color="text-red-500"
            bgColor="bg-red-500/10"
            to="/admin/rsvps"
            delay={0.1}
          />
          <StatCard
            label="Total Headcount"
            value={headcount ?? 0}
            icon={<TrendingUp className="w-5 h-5 text-gold" />}
            color="text-gold"
            bgColor="bg-gold/10"
            delay={0.15}
          />
          <StatCard
            label="Messages"
            value={stats?.guestbook.total ?? 0}
            icon={<MessageSquare className="w-5 h-5 text-amber-500" />}
            color="text-amber-500"
            bgColor="bg-amber-500/10"
            to="/admin/guestbook"
            delay={0.2}
          />
          <StatCard
            label="Photos"
            value={stats?.photos.total ?? 0}
            icon={<Image className="w-5 h-5 text-blue-500" />}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
            to="/admin/photos"
            delay={0.25}
          />
        </div>
      )}

      {/* Main Grid: Charts + Activity */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* RSVP Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-6 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg text-foreground">RSVP Breakdown</h3>
            <Link to="/admin/rsvps" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {statsLoading ? (
            <div className="h-28 bg-muted/50 rounded-lg animate-pulse" />
          ) : (
            <RingChart
              segments={rsvpSegments}
              total={stats?.rsvps.total ?? 0}
            />
          )}
        </motion.div>

        {/* Meal Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 lg:col-span-1"
        >
          <div className="flex items-center gap-2 mb-5">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Meal Preferences</h3>
          </div>
          {statsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ) : mealEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No meal preferences recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {mealEntries.map(([label, count]) => (
                <MealBar key={label} label={label} count={count} total={mealTotal} />
              ))}
              {(stats?.rsvps.allergies ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {stats?.rsvps.allergies} guest{(stats?.rsvps.allergies ?? 0) !== 1 ? 's' : ''} with allergies noted
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-6 lg:col-span-1"
        >
          <h3 className="font-serif text-lg text-foreground mb-5">Recent Activity</h3>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No activity yet.</p>
          ) : (
            <div className="space-y-1 max-h-[320px] overflow-y-auto">
              {recentActivity.map((item) => {
                const meta = activityMeta[item.type];
                return (
                  <div key={item.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                    <div className={cn('p-1.5 rounded-md flex-shrink-0 mt-0.5', meta.color)}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Pending Items + Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Items Needing Attention */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="font-serif text-lg text-foreground">Needs Attention</h3>
          </div>
          <div className="space-y-3">
            {(stats?.rsvps.noResponse ?? 0) > 0 && (
              <Link
                to="/admin/rsvps"
                className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-foreground">Pending RSVPs</span>
                </div>
                <span className="text-sm font-medium text-amber-600">{stats?.rsvps.noResponse}</span>
              </Link>
            )}
            {(stats?.guestbook.pending ?? 0) > 0 && (
              <Link
                to="/admin/guestbook"
                className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-foreground">Unapproved messages</span>
                </div>
                <span className="text-sm font-medium text-amber-600">{stats?.guestbook.pending}</span>
              </Link>
            )}
            {(stats?.photos.pending ?? 0) > 0 && (
              <Link
                to="/admin/photos"
                className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-foreground">Unapproved photos</span>
                </div>
                <span className="text-sm font-medium text-amber-600">{stats?.photos.pending}</span>
              </Link>
            )}
            {pendingCount === 0 && (stats?.rsvps.noResponse ?? 0) === 0 && (
              <div className="flex items-center gap-3 p-4 text-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">All caught up — nothing needs your attention!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-serif text-lg text-foreground mb-5">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction to="/admin/visual-editor" icon={<Palette className="w-4 h-4" />} label="Visual Editor" />
            <QuickAction to="/admin/rsvps" icon={<Users className="w-4 h-4" />} label="Manage RSVPs" badge={stats?.rsvps.noResponse ?? undefined} />
            <QuickAction to="/admin/invites" icon={<Mail className="w-4 h-4" />} label="Invite Links" />
            <QuickAction to="/admin/guestbook" icon={<MessageSquare className="w-4 h-4" />} label="Guestbook" badge={stats?.guestbook.pending ?? undefined} />
            <QuickAction to="/admin/photos" icon={<Image className="w-4 h-4" />} label="Photo Gallery" badge={stats?.photos.pending ?? undefined} />
            <QuickAction to="/admin/song-requests" icon={<Music className="w-4 h-4" />} label="Song Requests" />
            <QuickAction to="/admin/locked-pages" icon={<Lock className="w-4 h-4" />} label="Locked Pages" />
            <QuickAction to="/admin/content" icon={<FileText className="w-4 h-4" />} label="Edit Content" />
            <button
              onClick={handleExportRSVPs}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group w-full"
            >
              <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                <Download className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm text-foreground">Export RSVPs (CSV)</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
