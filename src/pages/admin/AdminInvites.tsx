import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2, Copy, Check, Trash2, Users, Plus, Loader2,
  BarChart3, MousePointer, UserCheck, QrCode, CreditCard,
  MessageSquareText, Download, Upload, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { InviteQRCode } from '@/components/features/admin/InviteQRCode';
import { InviteCardPreview } from '@/components/features/admin/InviteCardPreview';
import { InviteMessageTemplates } from '@/components/features/admin/InviteMessageTemplates';
import { ExcelImport } from '@/components/features/admin/ExcelImport';
import { StickerSheetDownload } from '@/components/features/admin/StickerSheetDownload';
import { exportToCSV } from '@/lib/csv';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  venue_name: string | null;
  venue_address: string | null;
  custom_message: string | null;
  language: string;
  created_at: string;
  rsvp?: {
    id: string;
    name: string;
    guests: number;
    attending: boolean;
  } | null;
  analytics?: InviteAnalytics;
}

interface NewInviteForm {
  label: string;
  maxGuests: number;
  venueName: string;
  venueAddress: string;
  customMessage: string;
  language: string;
}

const DEFAULT_FORM: NewInviteForm = {
  label: '',
  maxGuests: 2,
  venueName: '',
  venueAddress: '',
  customMessage: '',
  language: 'en',
};

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

function getInviteUrl(code: string): string {
  return `${window.location.origin}/invite/${code}`;
}

export default function AdminInvites() {
  const { logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [qrInvite, setQrInvite] = useState<Invite | null>(null);
  const [cardInvite, setCardInvite] = useState<Invite | null>(null);
  const [messageInvite, setMessageInvite] = useState<Invite | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form states
  const [newInvite, setNewInvite] = useState<NewInviteForm>(DEFAULT_FORM);
  const [bulkNames, setBulkNames] = useState('');
  const [bulkMaxGuests, setBulkMaxGuests] = useState(2);
  const [bulkProgress, setBulkProgress] = useState<{ total: number; done: number } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [excelProgress, setExcelProgress] = useState<{ total: number; done: number } | null>(null);
  const [isExcelImporting, setIsExcelImporting] = useState(false);
  const [togglingLangId, setTogglingLangId] = useState<string | null>(null);
  const [editInvite, setEditInvite] = useState<Invite | null>(null);
  const [editForm, setEditForm] = useState({ label: '', maxGuests: 2 });

  const isValidInvite = () => newInvite.maxGuests >= 1 && newInvite.maxGuests <= 20 && newInvite.label.trim().length > 0;

  // Fetch invites with linked RSVP data and analytics
  const { data: invites, isLoading } = useQuery({
    queryKey: ['admin-invites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invitesWithData = await Promise.all(
        (data || []).map(async (invite) => {
          let rsvp = null;
          if (invite.used_by) {
            const { data: rsvpData } = await supabase
              .from('rsvps')
              .select('id, name, guests, attending')
              .eq('id', invite.used_by)
              .single();
            rsvp = rsvpData;
          }

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
    mutationFn: async (form: NewInviteForm) => {
      const code = generateSecureCode();
      const { data, error } = await supabase
        .from('invites')
        .insert({
          code,
          max_guests: form.maxGuests,
          label: form.label || null,
          venue_name: form.venueName || null,
          venue_address: form.venueAddress || null,
          custom_message: form.customMessage || null,
          language: form.language || 'en',
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
      setNewInvite(DEFAULT_FORM);
      setShowAdvanced(false);
    },
    onError: (error) => {
      toast({ title: 'Error creating invite', description: error.message, variant: 'destructive' });
    },
  });

  // Bulk create mutation
  const handleBulkCreate = async () => {
    const names = bulkNames.split('\n').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) {
      toast({ title: 'No names entered', variant: 'destructive' });
      return;
    }

    setBulkProgress({ total: names.length, done: 0 });

    let created = 0;
    let failed = 0;

    for (const name of names) {
      const code = generateSecureCode();
      const { error } = await supabase.from('invites').insert({
        code,
        max_guests: bulkMaxGuests,
        label: name,
      });

      if (error) {
        failed++;
      } else {
        created++;
      }
      setBulkProgress({ total: names.length, done: created + failed });
    }

    queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
    setBulkProgress(null);
    setBulkNames('');
    setIsBulkOpen(false);

    toast({
      title: `Bulk create complete`,
      description: `${created} invites created${failed > 0 ? `, ${failed} failed` : ''}.`,
      variant: failed > 0 ? 'destructive' : 'default',
    });
  };

  // Update the guest name and party size on an existing invite.
  //
  // Deliberately never touches `code` — the invite URL and QR code are derived
  // from it, and those may already be printed and handed out. Editing here is
  // safe for invitations already in guests' hands.
  const updateInvite = useMutation({
    mutationFn: async ({ id, label, maxGuests }: { id: string; label: string; maxGuests: number }) => {
      const { error } = await supabase
        .from('invites')
        .update({ label: label.trim() || null, max_guests: maxGuests })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      toast({ title: 'Invite updated', description: 'The link and QR code are unchanged.' });
      setEditInvite(null);
    },
    onError: (error) => {
      toast({ title: 'Error updating invite', description: error.message, variant: 'destructive' });
    },
  });

  const openEdit = (invite: Invite) => {
    setEditForm({ label: invite.label || '', maxGuests: invite.max_guests });
    setEditInvite(invite);
  };

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

  const handleExcelImport = async (guests: { label: string; maxGuests: number }[]) => {
    setIsExcelImporting(true);
    setExcelProgress({ total: guests.length, done: 0 });
    let done = 0;
    for (const guest of guests) {
      const code = generateSecureCode();
      await supabase.from('invites').insert({
        code,
        max_guests: guest.maxGuests,
        label: guest.label,
      });
      done++;
      setExcelProgress({ total: guests.length, done });
    }
    queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
    setIsExcelImporting(false);
  };

  const toggleLanguage = async (invite: Invite) => {
    setTogglingLangId(invite.id);
    const next = invite.language === 'es' ? 'en' : 'es';
    const { error } = await supabase.from('invites').update({ language: next }).eq('id', invite.id);
    if (error) {
      toast({ title: 'Error updating language', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
    }
    setTogglingLangId(null);
  };

  const copyInviteUrl = (code: string, id: string) => {
    navigator.clipboard.writeText(getInviteUrl(code));
    setCopiedId(id);
    toast({ title: 'Link copied!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!invites) return;
    const headers = ['Label', 'Code', 'Invite URL', 'Language', 'Max Guests', 'Status', 'Used By', 'Views', 'RSVPs', 'Created'];
    const rows = invites.map((inv) => [
      inv.label || '',
      inv.code,
      getInviteUrl(inv.code),
      inv.language === 'es' ? 'Spanish' : 'English',
      inv.max_guests,
      inv.used_by ? 'Used' : 'Pending',
      inv.rsvp?.name || '',
      inv.analytics?.views ?? 0,
      inv.analytics?.rsvps ?? 0,
      new Date(inv.created_at).toLocaleDateString(),
    ]);
    exportToCSV(headers, rows, `invites-${format(new Date(), 'yyyy-MM-dd')}`);
    toast({ title: 'CSV exported!' });
  };

  const usedCount = invites?.filter(i => i.used_by).length || 0;
  const totalMaxGuests = invites?.reduce((sum, i) => sum + i.max_guests, 0) || 0;

  return (
    <AdminLayout onLogout={logout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Invite Links</h1>
          <p className="text-muted-foreground">Generate, manage, and share personalized invite links</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!invites?.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <ExcelImport
            onImport={handleExcelImport}
            isImporting={isExcelImporting}
            progress={excelProgress}
          />
          <StickerSheetDownload invites={invites ?? []} />
          <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Create Invites</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Guest Names (one per line)</Label>
                  <Textarea
                    placeholder={"Smith Family\nJohnson Family\nJane & John Doe"}
                    value={bulkNames}
                    onChange={(e) => setBulkNames(e.target.value)}
                    className="min-h-[160px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {bulkNames.split('\n').filter(n => n.trim()).length} names entered
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Max Guests Per Invite</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={bulkMaxGuests}
                    onChange={(e) => setBulkMaxGuests(parseInt(e.target.value) || 1)}
                  />
                </div>
                {bulkProgress && (
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {bulkProgress.done} / {bulkProgress.total} created
                    </p>
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={handleBulkCreate}
                  disabled={!!bulkProgress || !bulkNames.trim()}
                >
                  {bulkProgress ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    `Create ${bulkNames.split('\n').filter(n => n.trim()).length} Invites`
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) { setNewInvite(DEFAULT_FORM); setShowAdvanced(false); } }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Invite Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Guest Names *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Smith Family"
                    value={newInvite.label}
                    onChange={(e) => setNewInvite({ ...newInvite, label: e.target.value })}
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="language">Invitation Language</Label>
                  <Select
                    value={newInvite.language}
                    onValueChange={(value) => setNewInvite({ ...newInvite, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Options */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-primary hover:underline"
                >
                  {showAdvanced ? 'Hide' : 'Show'} advanced options
                </button>

                {showAdvanced && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="venueName">Custom Venue Name</Label>
                      <Input
                        id="venueName"
                        placeholder="Blue Dress Barn (default)"
                        value={newInvite.venueName}
                        onChange={(e) => setNewInvite({ ...newInvite, venueName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venueAddress">Custom Venue Address</Label>
                      <Input
                        id="venueAddress"
                        placeholder="Benton Harbor, Michigan (default)"
                        value={newInvite.venueAddress}
                        onChange={(e) => setNewInvite({ ...newInvite, venueAddress: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customMessage">Custom Message</Label>
                      <Textarea
                        id="customMessage"
                        placeholder="e.g., We can't wait to celebrate with you!"
                        value={newInvite.customMessage}
                        onChange={(e) => setNewInvite({ ...newInvite, customMessage: e.target.value })}
                        className="min-h-[80px]"
                      />
                      <p className="text-xs text-muted-foreground">Shown on the invitation card</p>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => createInvite.mutate(newInvite)}
                  disabled={createInvite.isPending || !isValidInvite()}
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
                          <td className="px-6 py-4 font-medium">
                            <span>{invite.label || '—'}</span>
                            {invite.language === 'es' && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">ES</span>
                            )}
                          </td>
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
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
                                <MousePointer className="w-3 h-3" />
                                {invite.analytics?.views || 0}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); toggleLanguage(invite); }}
                                title={invite.language === 'es' ? 'Switch to English' : 'Switch to Spanish'}
                                disabled={togglingLangId === invite.id}
                                className={invite.language === 'es' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-muted-foreground'}
                              >
                                {togglingLangId === invite.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <span className="text-xs font-semibold">{invite.language === 'es' ? 'ES' : 'EN'}</span>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); openEdit(invite); }}
                                title="Edit name and guest count"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); copyInviteUrl(invite.code, invite.id); }}
                                title="Copy link"
                              >
                                {copiedId === invite.id ? (
                                  <Check className="w-4 h-4 text-sage" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setQrInvite(invite); }}
                                title="QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setCardInvite(invite); }}
                                title="Invite Card"
                              >
                                <CreditCard className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setMessageInvite(invite); }}
                                title="Message Templates"
                              >
                                <MessageSquareText className="w-4 h-4" />
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
                              <div className="flex items-center gap-6 text-sm flex-wrap">
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

      {/* Edit Invite Dialog — name and party size only, so printed links and
          QR codes stay valid. */}
      <Dialog open={!!editInvite} onOpenChange={(open) => !open && setEditInvite(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-label">Guest Name</Label>
              <Input
                id="edit-label"
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                placeholder="e.g. The Garcia Family"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-max-guests">Guests Allowed</Label>
              <Input
                id="edit-max-guests"
                type="number"
                min={1}
                max={20}
                value={editForm.maxGuests}
                onChange={(e) =>
                  setEditForm({ ...editForm, maxGuests: Math.max(1, parseInt(e.target.value) || 1) })
                }
              />
              {editInvite?.rsvp && editForm.maxGuests < editInvite.rsvp.guests && (
                <p className="text-xs text-destructive">
                  This guest already RSVP'd for {editInvite.rsvp.guests}. Lowering the limit
                  won't change their existing response.
                </p>
              )}
            </div>

            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                The invite link and QR code will not change:
              </p>
              <code className="text-xs break-all block">{editInvite && getInviteUrl(editInvite.code)}</code>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditInvite(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  editInvite &&
                  updateInvite.mutate({
                    id: editInvite.id,
                    label: editForm.label,
                    maxGuests: editForm.maxGuests,
                  })
                }
                disabled={updateInvite.isPending}
              >
                {updateInvite.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrInvite} onOpenChange={(open) => !open && setQrInvite(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code — {qrInvite?.label || 'Invite'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {qrInvite && (
              <InviteQRCode
                url={getInviteUrl(qrInvite.code)}
                label={qrInvite.label || undefined}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Card Dialog */}
      <Dialog open={!!cardInvite} onOpenChange={(open) => !open && setCardInvite(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Card — {cardInvite?.label || 'Invite'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {cardInvite && (
              <InviteCardPreview
                label={cardInvite.label || 'Dear Guest'}
                url={getInviteUrl(cardInvite.code)}
                venueName={cardInvite.venue_name || undefined}
                venueAddress={cardInvite.venue_address || undefined}
                customMessage={cardInvite.custom_message || undefined}
                language={cardInvite.language || 'en'}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Templates Dialog */}
      <Dialog open={!!messageInvite} onOpenChange={(open) => !open && setMessageInvite(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Invite — {messageInvite?.label || 'Guest'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {messageInvite && (
              <InviteMessageTemplates
                label={messageInvite.label || 'Guest'}
                url={getInviteUrl(messageInvite.code)}
                language={messageInvite.language || 'en'}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
