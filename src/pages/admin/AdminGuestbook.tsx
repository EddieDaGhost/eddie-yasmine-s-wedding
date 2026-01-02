import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string | null;
  guest_id: string | null;
  approved: boolean | null;
  created_at: string;
}

const AdminGuestbook = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from('messages')
        .update({ approved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({ title: 'Message updated!' });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({ title: 'Message deleted!' });
    },
  });

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredMessages = messages?.filter((m) => {
    if (filter === 'pending') return !m.approved;
    if (filter === 'approved') return m.approved;
    return true;
  });

  const pendingCount = messages?.filter((m) => !m.approved).length || 0;

  return (
    <AdminLayout onLogout={logout}>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-1">Guestbook Messages</h1>
        <p className="text-muted-foreground">Moderate messages from guests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'approved', label: 'Approved' },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'romantic' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key as typeof filter)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages?.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    message.approved
                      ? 'bg-sage/20 text-sage-foreground'
                      : 'bg-gold/20 text-gold-foreground'
                  }`}>
                    {message.approved ? 'Approved' : 'Pending'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground">{message.content}</p>
              </div>

              <div className="flex gap-2">
                {!message.approved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateMessage.mutate({ id: message.id, approved: true })}
                  >
                    <CheckCircle className="w-4 h-4 text-sage" />
                  </Button>
                )}
                {message.approved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateMessage.mutate({ id: message.id, approved: false })}
                  >
                    <XCircle className="w-4 h-4 text-gold" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMessage.mutate(message.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredMessages?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No messages found.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGuestbook;
