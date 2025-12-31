import { isAfterWeddingDate } from '@/lib/wedding-utils';
import { LockedPage } from '@/components/shared/LockedPage';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { motion } from 'framer-motion';
import { Bell, Clock } from 'lucide-react';

interface Update {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const mockUpdates: Update[] = [
  {
    id: '1',
    title: 'Reception has started!',
    content: 'Head to the main hall for dinner and dancing. Cocktails are being served!',
    createdAt: '2027-07-02T18:30:00',
  },
  {
    id: '2',
    title: 'Ceremony complete!',
    content: 'Eddie and Yasmine are now officially married! Join us for cocktail hour in the garden.',
    createdAt: '2027-07-02T17:00:00',
  },
  {
    id: '3',
    title: 'Welcome!',
    content: 'We are so happy to have you here! The ceremony will begin at 4:00 PM sharp.',
    createdAt: '2027-07-02T15:00:00',
  },
];

const LiveUpdates = () => {
  if (!isAfterWeddingDate()) {
    return (
      <LockedPage
        title="Live Updates"
        description="Get real-time updates during the wedding celebration - available on the day!"
      />
    );
  }

  return (
    <Layout>
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Live Updates"
            subtitle="Real-time updates from the celebration."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {mockUpdates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                        {new Date(update.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LiveUpdates;
