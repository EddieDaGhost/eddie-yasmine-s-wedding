import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Loader2, Download, Trash2, ArrowUpDown, RotateCcw, Archive, Undo2 } from 'lucide-react';
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
  archived_at: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  attending: boolean | null;
  guests: number | null;
  meal_preference: string | null;
  dietary_needs: string | null;
  song_requests: string | null;
  message: string | null;
  invite_code: string | null;
  created_at: string;
}

type SortField = 'name' | 'email' | 'phone' | 'attending' | 'guests' | 'song_requests' | 'message' | 'created_at';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'attending' | 'declined' | 'pending' | 'archived';

const AdminRSVPs = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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

  // Reset an RSVP: archive it and free its invite so the guest can respond
  // again. The row is kept rather than deleted, so an accidental reset can be
  // reviewed and undone from the Archived filter.
  const resetRsvp = useMutation({
    mutationFn: async (rsvp: RSVP) => {
      const { error } = await supabase
        .from('rsvps')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', rsvp.id);
      if (error) throw error;

      // Release the invite so the link shows a fresh form again.
      await supabase.from('invites').update({ used_by: null }).eq('used_by', rsvp.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      toast({
        title: 'RSVP reset',
        description: 'The guest can RSVP again. The old response is kept under the Archived filter.',
      });
    },
    onError: (error) => {
      toast({ title: 'Error resetting RSVP', description: error.message, variant: 'destructive' });
    },
  });

  // Undo a reset, putting the response back into the active list.
  const restoreRsvp = useMutation({
    mutationFn: async (rsvp: RSVP) => {
      const { error } = await supabase
        .from('rsvps')
        .update({ archived_at: null })
        .eq('id', rsvp.id);
      if (error) throw error;

      if (rsvp.invite_code) {
        await supabase
          .from('invites')
          .update({ used_by: rsvp.id })
          .eq('code', rsvp.invite_code);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rsvps'] });
      toast({ title: 'RSVP restored', description: 'The response is active again.' });
    },
    onError: (error) => {
      toast({ title: 'Error restoring RSVP', description: error.message, variant: 'destructive' });
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

  // Filtering and sorting
  const filteredAndSortedRsvps = useMemo(() => {
    if (!rsvps) return [];

    // Archived responses are hidden from every active view and only appear
    // under their own filter.
    let filtered = statusFilter === 'archived'
      ? rsvps.filter((r) => r.archived_at)
      : rsvps.filter((r) => !r.archived_at);

    // Apply status filter
    if (statusFilter === 'attending') {
      filtered = filtered.filter((r) => r.attending === true);
    } else if (statusFilter === 'declined') {
      filtered = filtered.filter((r) => r.attending === false);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter((r) => r.attending === null);
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aVal: string | number | boolean | null;
      let bVal: string | number | boolean | null;

      switch (sortField) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aVal = a.email?.toLowerCase() || '';
          bVal = b.email?.toLowerCase() || '';
          break;
        case 'phone':
          aVal = a.phone || '';
          bVal = b.phone || '';
          break;
        case 'attending':
          aVal = a.attending === true ? 2 : a.attending === false ? 1 : 0;
          bVal = b.attending === true ? 2 : b.attending === false ? 1 : 0;
          break;
        case 'guests':
          aVal = a.guests || 0;
          bVal = b.guests || 0;
          break;
        case 'song_requests':
          aVal = a.song_requests?.toLowerCase() || '';
          bVal = b.song_requests?.toLowerCase() || '';
          break;
        case 'message':
          aVal = a.message?.toLowerCase() || '';
          bVal = b.message?.toLowerCase() || '';
          break;
        case 'created_at':
        default:
          aVal = a.created_at;
          bVal = b.created_at;
          break;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rsvps, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`Delete RSVP from "${name || 'Unknown'}"? This cannot be undone.`)) return;
    try {
      await deleteRsvps.mutateAsync([id]);
      toast({ title: 'RSVP deleted', description: `Removed RSVP from ${name || 'Unknown'}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete RSVP.', variant: 'destructive' });
    }
  };

  const handleReset = (rsvp: RSVP) => {
    if (
      !confirm(
        `Reset the RSVP from "${rsvp.name || 'Unknown'}"?\n\n` +
          'Their invite link will work again as if they had never responded. ' +
          'The current response is kept and can be restored from the Archived filter.'
      )
    ) {
      return;
    }
    resetRsvp.mutate(rsvp);
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
    if (!filteredAndSortedRsvps) return;
    if (selected.size === filteredAndSortedRsvps.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredAndSortedRsvps.map((r) => r.id)));
    }
  };

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Counts reflect live responses only — a reset RSVP must not inflate them.
  const active = rsvps?.filter((r) => !r.archived_at) || [];
  const stats = {
    total: active.length,
    attending: active.filter((r) => r.attending === true).length,
    declined: active.filter((r) => r.attending === false).length,
    pending: active.filter((r) => r.attending === null).length,
    totalGuests: active.filter((r) => r.attending === true).reduce((acc, r) => acc + (r.guests || 1), 0),
    archived: rsvps?.filter((r) => r.archived_at).length || 0,
  };

  const handleExportCSV = () => {
    if (!rsvps) return;
    const headers = ['Name', 'Email', 'Phone', 'Attending', 'Guests', 'Meal Preference', 'Dietary Needs', 'Song Requests', 'Message', 'Invite Code', 'Date', 'Status'];
    const rows = rsvps.map((r) => [
      r.name || '',
      r.email || '',
      r.phone || '',
      r.attending === true ? 'Yes' : r.attending === false ? 'No' : 'Pending',
      r.guests ?? 1,
      r.meal_preference || '',
      r.dietary_needs || '',
      r.song_requests || '',
      r.message || '',
      r.invite_code || '',
      new Date(r.created_at).toLocaleDateString(),
      r.archived_at ? `Reset ${new Date(r.archived_at).toLocaleDateString()}` : 'Active',
    ]);
    exportToCSV(headers, rows, `rsvps-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left px-4 py-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-primary' : 'opacity-40'}`} />
      </span>
    </th>
  );

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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-primary', filter: 'all' as StatusFilter },
          { label: 'Attending', value: stats.attending, icon: CheckCircle, color: 'text-sage', filter: 'attending' as StatusFilter },
          { label: 'Declined', value: stats.declined, icon: XCircle, color: 'text-destructive', filter: 'declined' as StatusFilter },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-gold', filter: 'pending' as StatusFilter },
          { label: 'Total Guests', value: stats.totalGuests, icon: Users, color: 'text-primary', filter: 'all' as StatusFilter },
          { label: 'Archived', value: stats.archived, icon: Archive, color: 'text-muted-foreground', filter: 'archived' as StatusFilter },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
              statusFilter === stat.filter && stat.label !== 'Total Guests'
                ? 'ring-2 ring-primary/40'
                : 'hover:ring-1 hover:ring-border'
            }`}
            onClick={() => {
              if (stat.label !== 'Total Guests') {
                setStatusFilter(statusFilter === stat.filter ? 'all' : stat.filter);
              }
            }}
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-display text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active filter indicator */}
      {statusFilter !== 'all' && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing: <span className="font-medium text-foreground capitalize">{statusFilter}</span>
          </span>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setStatusFilter('all')}>
            Clear filter
          </Button>
        </div>
      )}

      {/* RSVP Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredAndSortedRsvps.length > 0 && selected.size === filteredAndSortedRsvps.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <SortHeader field="name">Name</SortHeader>
                <SortHeader field="email">Email</SortHeader>
                <SortHeader field="phone">Phone</SortHeader>
                <SortHeader field="attending">Status</SortHeader>
                <SortHeader field="guests">Guests</SortHeader>
                <th className="text-left px-4 py-4 text-sm font-medium text-muted-foreground">Dietary</th>
                <SortHeader field="song_requests">Song</SortHeader>
                <SortHeader field="message">Notes</SortHeader>
                <SortHeader field="created_at">Date</SortHeader>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedRsvps.map((rsvp) => (
                <tr key={rsvp.id} className={`hover:bg-muted/30 transition-colors ${selected.has(rsvp.id) ? 'bg-primary/5' : ''} ${rsvp.archived_at ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(rsvp.id)}
                      onChange={() => toggleSelect(rsvp.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {rsvp.name || '-'}
                    {rsvp.archived_at && (
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                        title={`Reset ${format(new Date(rsvp.archived_at), 'PPp')}`}
                      >
                        Reset
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-sm">{rsvp.email || '-'}</td>
                  <td className="px-4 py-4 text-muted-foreground text-sm">{rsvp.phone || '-'}</td>
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
                  <td className="px-4 py-4 text-sm max-w-[150px] truncate">
                    {rsvp.dietary_needs ? (
                      <span className="text-amber-700 dark:text-amber-400 font-medium" title={rsvp.dietary_needs}>
                        {rsvp.dietary_needs}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-sm max-w-[150px] truncate">
                    {rsvp.song_requests || '-'}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-sm max-w-[150px] truncate">
                    {rsvp.message || '-'}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-sm whitespace-nowrap">
                    {formatDistanceToNow(new Date(rsvp.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      {rsvp.archived_at ? (
                        <button
                          onClick={() => restoreRsvp.mutate(rsvp)}
                          disabled={restoreRsvp.isPending}
                          className="text-muted-foreground hover:text-sage transition-colors p-1"
                          title="Restore this RSVP"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReset(rsvp)}
                          disabled={resetRsvp.isPending}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Reset — lets this guest RSVP again, keeping a copy"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rsvp.id, rsvp.name)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Delete RSVP permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedRsvps.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {statusFilter !== 'all' ? `No ${statusFilter} RSVPs found.` : 'No RSVPs yet.'}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRSVPs;
