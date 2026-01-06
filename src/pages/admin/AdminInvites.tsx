import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Link2, Copy, Check, Trash2, Users, Plus, Eye, 
  LogOut, Settings, MessageSquare, Image, Bell, Loader2,
  BarChart3, MousePointer, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface InviteAnalytics {
  views: number;
  rsvps: number;
  checkins: number;
  lastView: string | null;
  lastRsvp: string | null;
}

interface Invite {
  id: string;
  code: string;
  max_guests: number;
  used_by: string | null;
  label: string | null;
  created_at: string;
  rsvp?: {
    id: string;
    name: string;
    guests: number;
    attending: boolean;
  } | null;
  analytics?: InviteAnalytics;
}

function generateSecureCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  for (let i = 0; i < 12; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

export default function AdminInvites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({ label: '', maxGuests: 2 });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch invites with linked RSVP data and analytics
  const { data: invites, isLoading } = useQuery({
    queryKey: ['admin-invites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch linked RSVPs and analytics for all invites
      const invitesWithData = await Promise.all(
        (data || []).map(async (invite) => {
          // Fetch RSVP if used
          let rsvp = null;
          if (invite.used_by) {
            const { data: rsvpData } = await supabase
              .from('rsvps')
              .select('id, name, guests, attending')
              .eq('id', invite.used_by)
              .single();
            rsvp = rsvpData;
          }

          // Fetch analytics for this invite
          const { data: analyticsData } = await supabase
            .from('invite_analytics')
            .select('event_type, created_at')
            .eq('invite_id', invite.id)
            .order('created_at', { ascending: false });

          const views = analyticsData?.filter(a => a.event_type === 'view') || [];
          const rsvps = analyticsData?.filter(a => a.event_type === 'rsvp') || [];
          const checkins = analyticsData?.filter(a => a.event_type === 'checkin') || [];

          const analytics: InviteAnalytics = {
            views: views.length,
            rsvps: rsvps.length,
            checkins: checkins.length,
            lastView: views[0]?.created_at || null,
            lastRsvp: rsvps[0]?.created_at || null,
          };

          return { ...invite, rsvp, analytics };
        })
      );

      return invitesWithData as Invite[];
    },
  });

  // Create invite mutation
  const createInvite = useMutation({
    mutationFn: async ({ label, maxGuests }: { label: string; maxGuests: number }) => {
      const code = generateSecureCode();
      const { data, error } = await supabase
        .from('invites')
        .insert({
          code,
          max_guests: maxGuests,
          label: label || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      toast({ title: 'Invite created!', description: 'Copy the link to share with your guests.' });
      setIsCreateOpen(false);
      setNewInvite({ label: '', maxGuests: 2 });
    },
    onError: (error) => {
      toast({ title: 'Error creating invite', description: error.message, variant: 'destructive' });
    },
  });

  // Delete invite mutation
  const deleteInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      toast({ title: 'Invite deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting invite', description: error.message, variant: 'destructive' });
    },
  });

  const copyInviteUrl = (code: string, id: string) => {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: 'Link copied!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin');
  };

  const usedCount = invites?.filter(i => i.used_by).length || 0;
  const totalMaxGuests = invites?.reduce((sum, i) => sum + i.max_guests, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-6 h-6 text-primary" />
          <span className="font-serif text-xl">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Eye className="w-5 h-5" />
            View Site
          </Link>
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/admin/invites" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
            <Link2 className="w-5 h-5" />
            Invite Links
          </Link>
          <Link to="/admin/rsvps" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
            RSVPs
          </Link>
          <Link to="/admin/content" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            Edit Content
          </Link>
          <Link to="/admin/guestbook" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <MessageSquare className="w-5 h-5" />
            Guestbook
          </Link>
          <Link to="/admin/photos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Image className="w-5 h-5" />
            Photos
          </Link>
          <Link to="/admin/song-requests" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            Song Requests
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">Invite Links</h1>
            <p className="text-muted-foreground">Generate and manage invite links for your guests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout} className="lg:hidden">
              <LogOut className="w-5 h-5" />
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Invite Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label (optional)</Label>
                    <Input
                      id="label"
                      placeholder="e.g., Smith Family"
                      value={newInvite.label}
                      onChange={(e) => setNewInvite({ ...newInvite, label: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">For your reference only</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Maximum Guests</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      min={1}
                      max={20}
                      value={newInvite.maxGuests}
                      onChange={(e) => setNewInvite({ ...newInvite, maxGuests: parseInt(e.target.value) || 1 })}
                    />
                    <p className="text-xs text-muted-foreground">Total number of people who can RSVP with this link</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => createInvite.mutate({ label: newInvite.label, maxGuests: newInvite.maxGuests })}
                    disabled={createInvite.isPending}
                  >
                    {createInvite.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Invite'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Invites', value: invites?.length || 0, icon: Link2, color: 'text-primary' },
            { label: 'Used', value: usedCount, icon: Check, color: 'text-sage' },
            { label: 'Pending', value: (invites?.length || 0) - usedCount, icon: Users, color: 'text-gold' },
            { label: 'Max Guests', value: totalMaxGuests, icon: Users, color: 'text-accent' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
              <p className="text-3xl font-display text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Invites List */}
        <div className="glass-card rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : invites && invites.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Label</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Code</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Max Guests</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Used By</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invites.map((invite) => (
                    <Collapsible key={invite.id} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <tr className="hover:bg-muted/30 transition-colors cursor-pointer">
                            <td className="px-6 py-4 font-medium">{invite.label || '—'}</td>
                            <td className="px-6 py-4">
                              <code className="text-sm bg-muted px-2 py-1 rounded">{invite.code}</code>
                            </td>
                            <td className="px-6 py-4">{invite.max_guests}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                invite.used_by 
                                  ? 'bg-sage/20 text-sage-foreground' 
                                  : 'bg-gold/20 text-gold-foreground'
                              }`}>
                                {invite.used_by ? 'Used' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {invite.rsvp ? (
                                <span>
                                  {invite.rsvp.name} ({invite.rsvp.guests} guest{invite.rsvp.guests !== 1 ? 's' : ''})
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-sm">
                              {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-muted-foreground mr-2 flex items-center gap-1">
                                  <MousePointer className="w-3 h-3" />
                                  {invite.analytics?.views || 0}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyInviteUrl(invite.code, invite.id);
                                  }}
                                  title="Copy invite link"
                                >
                                  {copiedId === invite.id ? (
                                    <Check className="w-4 h-4 text-sage" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      title="Delete invite"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this invite?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. The invite link will no longer work.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteInvite.mutate(invite.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <tr className="bg-muted/20">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Analytics</span>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MousePointer className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground">Views:</span>
                                    <span className="font-medium">{invite.analytics?.views || 0}</span>
                                    {invite.analytics?.lastView && (
                                      <span className="text-xs text-muted-foreground">
                                        (last: {format(new Date(invite.analytics.lastView), 'MMM d, h:mm a')})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-sage" />
                                    <span className="text-muted-foreground">RSVPs:</span>
                                    <span className="font-medium">{invite.analytics?.rsvps || 0}</span>
                                    {invite.analytics?.lastRsvp && (
                                      <span className="text-xs text-muted-foreground">
                                        (last: {format(new Date(invite.analytics.lastRsvp), 'MMM d, h:mm a')})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-gold" />
                                    <span className="text-muted-foreground">Check-ins:</span>
                                    <span className="font-medium">{invite.analytics?.checkins || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No invite links yet</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Invite
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
