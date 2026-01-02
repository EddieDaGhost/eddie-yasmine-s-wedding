import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface RSVP {
  id: string;
  name: string | null;
  email: string | null;
  attending: boolean | null;
  guests: number | null;
  message: string | null;
  created_at: string;
}

const AdminRSVPs = () => {
  const { isAuthenticated, logout } = useAdminAuth();

  const { data: rsvps, isLoading } = useQuery({
    queryKey: ['admin-rsvps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RSVP[];
    },
  });

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: rsvps?.length || 0,
    attending: rsvps?.filter((r) => r.attending === true).length || 0,
    declined: rsvps?.filter((r) => r.attending === false).length || 0,
    pending: rsvps?.filter((r) => r.attending === null).length || 0,
    totalGuests: rsvps?.filter((r) => r.attending === true).reduce((acc, r) => acc + (r.guests || 1), 0) || 0,
  };

  const exportCSV = () => {
    if (!rsvps) return;
    const headers = ['Name', 'Email', 'Attending', 'Guests', 'Message', 'Date'];
    const rows = rsvps.map((r) => [
      r.name || '',
      r.email || '',
      r.attending === true ? 'Yes' : r.attending === false ? 'No' : 'Pending',
      r.guests?.toString() || '1',
      r.message || '',
      new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rsvps.csv';
    a.click();
  };

  return (
    <AdminLayout onLogout={logout}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">RSVP Responses</h1>
          <p className="text-muted-foreground">View and manage guest responses</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Attending', value: stats.attending, icon: CheckCircle, color: 'text-sage' },
          { label: 'Declined', value: stats.declined, icon: XCircle, color: 'text-destructive' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-gold' },
          { label: 'Total Guests', value: stats.totalGuests, icon: Users, color: 'text-primary' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-display text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* RSVP Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Guests</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Message</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rsvps?.map((rsvp) => (
                <tr key={rsvp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{rsvp.name || '-'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{rsvp.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      rsvp.attending === true ? 'bg-sage/20 text-sage-foreground' :
                      rsvp.attending === false ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {rsvp.attending === true ? 'Attending' : rsvp.attending === false ? 'Declined' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{rsvp.guests || 1}</td>
                  <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                    {rsvp.message || '-'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(rsvp.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rsvps?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No RSVPs yet.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRSVPs;
