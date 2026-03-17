import { useState, useEffect } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface LiveUpdate {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const LiveUpdates = () => {
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['live-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as LiveUpdate[];
    },
    staleTime: 30 * 1000,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('live-updates-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_updates' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-updates'] });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Live Updates"
        description="Get real-time updates during the wedding celebration - available on the day!"
      />
    );
  }

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Live Updates" />}

      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Live Updates"
            subtitle="Real-time updates from the celebration."
          />
          <div className="flex items-center justify-center gap-2 mt-4">
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-sage' : 'text-muted-foreground/40'}`} />
            <span className={`text-xs ${isConnected ? 'text-sage' : 'text-muted-foreground/40'}`}>
              {isConnected ? 'Connected — updates appear instantly' : 'Connecting...'}
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading updates...</div>
            ) : updates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <Bell className="w-10 h-10 text-primary/30 mx-auto mb-4" />
                <h3 className="font-serif text-xl text-foreground mb-2">No updates yet</h3>
                <p className="text-muted-foreground">
                  Check back soon — updates will appear here in real time!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {updates.map((update, index) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="glass-card rounded-2xl p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif text-xl text-foreground mb-2">
                            {update.title}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {update.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                            <Clock className="w-3 h-3" />
                            {new Date(update.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LiveUpdates;
