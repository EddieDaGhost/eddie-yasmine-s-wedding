import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Send, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/lib/sanitize';

interface GuestMessage {
  id: string;
  author_name: string | null;
  content: string | null;
  created_at: string;
}

const NAME_MAX = 100;
const MESSAGE_MAX = 2000;

const MessageWall = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  // Hooks must run before the locked early-return below.
  const { data: messages, isLoading } = useQuery({
    queryKey: ['guest-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, author_name, content, created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GuestMessage[];
    },
    enabled: isUnlocked,
  });

  const postMessage = useMutation({
    mutationFn: async ({ author, body }: { author: string; body: string }) => {
      const { error } = await supabase.from('messages').insert({
        author_name: sanitizeText(author).slice(0, NAME_MAX),
        content: sanitizeText(body).slice(0, MESSAGE_MAX),
        approved: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-messages'] });
      setName('');
      setContent('');
      toast({
        title: 'Message posted!',
        description: 'Thank you for your kind words.',
      });
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : '';
      toast({
        title: 'Could not post your message',
        description: /rate limit/i.test(message)
          ? 'You have posted a few times already — please wait a moment and try again.'
          : message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Message Wall"
        description="Leave your wishes and messages for the happy couple - available on the wedding day!"
      />
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    postMessage.mutate({ author: name.trim(), body: content.trim() });
  };

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Message Wall" />}

      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Guestbook"
            subtitle="Share your wishes and messages with the happy couple."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Message Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-6 mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-xl text-foreground">Leave a Message</h3>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={NAME_MAX}
                  required
                />
                <Textarea
                  placeholder="Your message to Eddie & Yasmine..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  maxLength={MESSAGE_MAX}
                  required
                />
                <Button
                  type="submit"
                  variant="romantic"
                  className="w-full"
                  disabled={postMessage.isPending}
                >
                  {postMessage.isPending ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </motion.form>

            {/* Messages List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.1 }}
                    className="glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-lg text-foreground mb-1">
                          {message.author_name || 'A guest'}
                        </p>
                        <p className="text-muted-foreground mb-2 whitespace-pre-line break-words">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {new Date(message.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No messages yet — be the first to leave one.
              </p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MessageWall;
