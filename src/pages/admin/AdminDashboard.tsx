import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, MessageSquare, Image, Bell, Settings, LogOut, 
  Heart, CheckCircle, XCircle, Eye, Trash2, Plus,
  BarChart3, Calendar, Mail, Camera, Edit2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Guest {
  id: string;
  name: string;
  email: string;
  attending: boolean | null;
  guests: number;
  meal_preference?: string | null;
  song_requests?: string | null;
  message: string | null;
}

interface Message {
  id: string;
  name: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

interface Photo {
  id: string;
  file_url: string | null;
  caption: string | null;
  guest_id: string;
  approved: boolean | null;
  created_at: string;
}

const mockMessages: Message[] = [
  { id: '1', name: 'Sarah & Tom', content: 'Wishing you both a lifetime of love!', approved: true, createdAt: '2027-07-02T16:30:00' },
  { id: '2', name: 'The Chen Family', content: 'Congratulations! So happy for you both.', approved: false, createdAt: '2027-07-02T17:00:00' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [photoFilter, setPhotoFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editCaption, setEditCaption] = useState('');

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch RSVPs from Supabase
    const fetchGuests = async () => {
      try {
        const { data, error } = await supabase
          .from('rsvps')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform rsvps to Guest interface
        const transformedGuests = (data || []).map((rsvp) => ({
          id: rsvp.id,
          name: rsvp.name || '',
          email: rsvp.email || '',
          attending: rsvp.attending,
          guests: rsvp.guests || 0,
          meal_preference: rsvp.meal_preference || null,
          song_requests: rsvp.song_requests || null,
          message: rsvp.message || null,
        }));

        setGuests(transformedGuests);
      } catch (error) {
        console.error('Error fetching RSVPs:', error);
        toast({ title: "Error", description: "Failed to load RSVPs", variant: "destructive" });
      } finally {
        setIsLoadingGuests(false);
      }
    };

    fetchGuests();
  }, [toast]);

  // Fetch photos
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['admin-dashboard-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Photo[];
    },
  });

  // Photo mutations
  const updatePhoto = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Photo> }) => {
      const { error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-photos'] });
      toast({ title: 'Photo updated!' });
      setEditingPhoto(null);
    },
    onError: (error) => {
      toast({ title: 'Error updating photo', description: error.message, variant: 'destructive' });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-photos'] });
      toast({ title: 'Photo deleted!' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting photo', description: error.message, variant: 'destructive' });
    },
  });

  const handleEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditCaption(photo.caption || '');
  };

  const handleSavePhotoEdit = () => {
    if (editingPhoto) {
      updatePhoto.mutate({
        id: editingPhoto.id,
        updates: { caption: editCaption },
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin');
  };

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.attending === true).length,
    declined: guests.filter(g => g.attending === false).length,
    pending: guests.filter(g => g.attending === null).length,
    totalGuests: guests.filter(g => g.attending === true).reduce((acc, g) => acc + 1 + g.guests, 0),
  };

  const approveMessage = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, approved: true } : m));
    toast({ title: "Message approved!" });
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
    toast({ title: "Message deleted!" });
  };

  const postUpdate = () => {
    if (!newUpdate.title || !newUpdate.content) return;
    toast({ title: "Update posted!", description: "All guests will see this update." });
    setNewUpdate({ title: '', content: '' });
  };

  // Filter photos
  const filteredPhotos = photos?.filter((p) => {
    if (photoFilter === 'pending') return !p.approved;
    if (photoFilter === 'approved') return p.approved;
    return true;
  });

  const pendingPhotosCount = photos?.filter((p) => !p.approved).length || 0;

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
          <Link to="/admin/invites" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Plus className="w-5 h-5" />
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
            <h1 className="font-display text-3xl text-foreground mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Manage your wedding website</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="lg:hidden">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Invited', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Attending', value: stats.attending, icon: CheckCircle, color: 'text-sage' },
            { label: 'Declined', value: stats.declined, icon: XCircle, color: 'text-destructive' },
            { label: 'Total Guests', value: stats.totalGuests, icon: BarChart3, color: 'text-gold' },
            { label: 'Pending Photos', value: pendingPhotosCount, icon: Camera, color: 'text-amber-500' },
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

        {/* Tabs */}
        <Tabs defaultValue="guests" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="guests" className="gap-2">
              <Users className="w-4 h-4" /> Guests
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <Camera className="w-4 h-4" /> Photos {pendingPhotosCount > 0 && `(${pendingPhotosCount})`}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Messages
            </TabsTrigger>
            <TabsTrigger value="updates" className="gap-2">
              <Bell className="w-4 h-4" /> Updates
            </TabsTrigger>
          </TabsList>

          {/* Guests Tab */}
          <TabsContent value="guests">
            <div className="glass-card rounded-xl overflow-hidden">
              {isLoadingGuests ? (
                <div className="p-8 text-center text-muted-foreground">Loading RSVPs...</div>
              ) : guests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No RSVPs yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Guests</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Meal</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Song</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-medium">{guest.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{guest.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              guest.attending === true ? 'bg-sage/20 text-sage-foreground' :
                              guest.attending === false ? 'bg-destructive/20 text-destructive' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {guest.attending === true ? 'Attending' : guest.attending === false ? 'Declined' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">{guest.guests}</td>
                          <td className="px-6 py-4 text-muted-foreground">{guest.meal_preference || '—'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{guest.song_requests || '—'}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">{guest.message ? guest.message.substring(0, 50) + '...' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <div className="space-y-4">
              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: `All (${photos?.length || 0})` },
                  { key: 'pending', label: `Pending (${pendingPhotosCount})` },
                  { key: 'approved', label: `Approved (${photos?.filter(p => p.approved).length || 0})` },
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    variant={photoFilter === tab.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoFilter(tab.key as typeof photoFilter)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Photos Grid */}
              {photosLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredPhotos && filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredPhotos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card rounded-xl overflow-hidden group"
                    >
                      <div className="aspect-square bg-muted relative">
                        {photo.file_url ? (
                          <img
                            src={photo.file_url}
                            alt={photo.caption || 'Guest photo'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            photo.approved
                              ? 'bg-green-500/90 text-white'
                              : 'bg-amber-500/90 text-white'
                          }`}>
                            {photo.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!photo.approved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-9 p-0"
                              onClick={() => updatePhoto.mutate({ id: photo.id, updates: { approved: true } })}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-9 p-0"
                              onClick={() => updatePhoto.mutate({ id: photo.id, updates: { approved: false } })}
                              title="Unapprove"
                            >
                              <XCircle className="w-4 h-4 text-amber-500" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 w-9 p-0"
                            onClick={() => handleEditPhoto(photo)}
                            title="Edit Caption"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 w-9 p-0"
                            onClick={() => deletePhoto.mutate(photo.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3">
                        {photo.caption && (
                          <p className="text-sm text-foreground truncate mb-1">{photo.caption}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(photo.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No photos found.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-serif text-lg">{message.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          message.approved ? 'bg-sage/20 text-sage-foreground' : 'bg-gold/20 text-gold-foreground'
                        }`}>
                          {message.approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{message.content}</p>
                    </div>
                    <div className="flex gap-2">
                      {!message.approved && (
                        <Button size="sm" variant="outline" onClick={() => approveMessage(message.id)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteMessage(message.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-serif text-xl mb-6">Post a Live Update</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Update title..."
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                />
                <Textarea
                  placeholder="Update content..."
                  value={newUpdate.content}
                  onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                  rows={4}
                />
                <Button variant="romantic" onClick={postUpdate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Update
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Photo Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={(open) => !open && setEditingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingPhoto?.file_url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={editingPhoto.file_url}
                  alt="Photo preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-caption">Caption</Label>
              <Textarea
                id="edit-caption"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Enter a caption for this photo..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePhotoEdit} disabled={updatePhoto.isPending}>
                {updatePhoto.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
