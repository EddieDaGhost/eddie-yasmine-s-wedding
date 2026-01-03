import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, MessageSquare, Image, Bell, Settings, LogOut, 
  Heart, CheckCircle, XCircle, Eye, Trash2, Plus,
  BarChart3, Calendar, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Guest {
  id: string;
  name: string;
  email: string;
  attending: boolean | null;
  plusOnes: number;
  dietaryNeeds: string;
  songRequest: string;
}

interface Message {
  id: string;
  name: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

const mockGuests: Guest[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@email.com', attending: true, plusOnes: 1, dietaryNeeds: 'Vegetarian', songRequest: 'At Last by Etta James' },
  { id: '2', name: 'Marcus Johnson', email: 'marcus@email.com', attending: true, plusOnes: 0, dietaryNeeds: '', songRequest: '' },
  { id: '3', name: 'Emma Rodriguez', email: 'emma@email.com', attending: null, plusOnes: 0, dietaryNeeds: '', songRequest: '' },
  { id: '4', name: 'David Kim', email: 'david@email.com', attending: false, plusOnes: 0, dietaryNeeds: '', songRequest: '' },
];

const mockMessages: Message[] = [
  { id: '1', name: 'Sarah & Tom', content: 'Wishing you both a lifetime of love!', approved: true, createdAt: '2027-07-02T16:30:00' },
  { id: '2', name: 'The Chen Family', content: 'Congratulations! So happy for you both.', approved: false, createdAt: '2027-07-02T17:00:00' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin');
  };

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.attending === true).length,
    declined: guests.filter(g => g.attending === false).length,
    pending: guests.filter(g => g.attending === null).length,
    totalGuests: guests.filter(g => g.attending === true).reduce((acc, g) => acc + 1 + g.plusOnes, 0),
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Invited', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Attending', value: stats.attending, icon: CheckCircle, color: 'text-sage' },
            { label: 'Declined', value: stats.declined, icon: XCircle, color: 'text-destructive' },
            { label: 'Total Guests', value: stats.totalGuests, icon: BarChart3, color: 'text-gold' },
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Plus Ones</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Dietary</th>
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
                        <td className="px-6 py-4">{guest.plusOnes}</td>
                        <td className="px-6 py-4 text-muted-foreground">{guest.dietaryNeeds || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
    </div>
  );
};

export default AdminDashboard;
