import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Loader2, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { exportToCSV } from '@/lib/csv';
import { useToast } from '@/hooks/use-toast';

interface RSVP {
  id: string;
  name: string | null;
  email: string | null;
  attending: boolean | null;
  guests: number | null;
  meal_preference: string | null;
  song_requests: string | null;
  message: string | null;
  invite_code: string | null;
  created_at: string;
}

const AdminRSVPs = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const deleteRsvps = useMutation({
    mutationFn: async (ids: string[]) => {
      // Also clear used_by on any invites pointing to these RSVPs
      for (const id of ids) {
        await supabase
          .from('invites')
          .update({ used_by: null })
          .eq('used_by', id);
      }
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      setSelected(new Set());
    },
  });

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`Delete RSVP from "${name || 'Unknown'}"? This cannot be undone.`)) return;
    try {
      await deleteRsvps.mutateAsync([id]);
      toast({ title: 'RSVP deleted', description: `Removed RSVP from ${name || 'Unknown'}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete RSVP.', variant: 'destructive' });
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected RSVP(s)? This cannot be undone.`)) return;
    try {
      await deleteRsvps.mutateAsync(Array.from(selected));
      toast({ title: 'RSVPs deleted', description: `Removed ${selected.size} RSVP(s).` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete RSVPs.', variant: 'destructive' });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!rsvps) return;
    if (selected.size === rsvps.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rsvps.map((r) => r.id)));
    }
  };

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

  const handleExportCSV = () => {
    if (!rsvps) return;
    const headers = ['Name', 'Email', 'Attending', 'Guests', 'Meal Preference', 'Song Requests', 'Message', 'Invite Code', 'Date'];
    const rows = rsvps.map((r) => [
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
  };

  return (
    <AdminLayout onLogout={logout}>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">RSVP Responses</h1>
          <p className="text-muted-foreground">View and manage guest responses</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deleteRsvps.isPending}
            >
              {deleteRsvps.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete {selected.size} Selected
            </Button>
          )}
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
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
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={rsvps != null && rsvps.length > 0 && selected.size === rsvps.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Guests</th>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Meal</th>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Message</th>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rsvps?.map((rsvp) => (
                <tr key={rsvp.id} className={`hover:bg-muted/30 transition-colors ${selected.has(rsvp.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(rsvp.id)}
                      onChange={() => toggleSelect(rsvp.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-4 font-medium">{rsvp.name || '-'}</td>
                  <td className="px-4 py-4 text-muted-foreground text-sm">{rsvp.email || '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      rsvp.attending === true ? 'bg-sage/20 text-sage-foreground' :
                      rsvp.attending === false ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {rsvp.attending === true ? 'Attending' : rsvp.attending === false ? 'Declined' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4">{rsvp.guests || 1}</td>
                  <td className="px-4 py-4 text-muted-foreground text-sm max-w-[150px] truncate">
                    {rsvp.meal_preference || '-'}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-sm max-w-[150px] truncate">
                    {rsvp.message || '-'}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(rsvp.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(rsvp.id, rsvp.name)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Delete RSVP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
