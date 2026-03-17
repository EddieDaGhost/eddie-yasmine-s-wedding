import { useState } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Music, Utensils, Star, Camera, Sparkles } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  detail?: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: 'first-meet',
    date: 'September 2019',
    title: 'The First Meeting',
    description: "We met at a mutual friend's birthday party. Eddie spilled coffee on Yasmine's dress, and somehow that clumsy moment became the beginning of our forever.",
    icon: <Star className="w-5 h-5" />,
    color: 'bg-gold/20 text-gold',
    detail: "Eddie still insists it was a strategic move. Yasmine's not buying it.",
  },
  {
    id: 'first-date',
    date: 'December 2019',
    title: 'The First Date',
    description: 'After weeks of texting, Eddie finally asked Yasmine out for dinner. We talked for hours and closed down the restaurant.',
    icon: <Utensils className="w-5 h-5" />,
    color: 'bg-blush/30 text-primary',
    detail: "The waiter had to politely ask us to leave — twice.",
  },
  {
    id: 'official',
    date: 'February 2020',
    title: 'Making It Official',
    description: 'Under a starlit sky, we decided to officially become a couple. Little did we know this was just the beginning.',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-primary/15 text-primary',
    detail: "Right before the world shut down — perfect timing to be stuck together!",
  },
  {
    id: 'first-trip',
    date: 'July 2020',
    title: 'First Road Trip Together',
    description: 'With the world on pause, we hit the open road. A week of camping, wrong turns, and the best conversations of our lives.',
    icon: <MapPin className="w-5 h-5" />,
    color: 'bg-sage/20 text-sage',
    detail: "We got lost three times on day one. Eddie blamed the GPS. Yasmine was the GPS.",
  },
  {
    id: 'first-song',
    date: 'November 2020',
    title: 'Our Song',
    description: 'Dancing in the kitchen to a random playlist — one song came on and we both just stopped and looked at each other. That became our song.',
    icon: <Music className="w-5 h-5" />,
    color: 'bg-champagne/30 text-champagne-foreground',
  },
  {
    id: 'moved-in',
    date: 'March 2021',
    title: 'Moving In Together',
    description: 'We took the leap and moved into our first apartment together. Learning to share a space taught us the true meaning of partnership.',
    icon: <MapPin className="w-5 h-5" />,
    color: 'bg-sage/20 text-sage',
    detail: "The Great Thermostat Debate of 2021 is still unresolved.",
  },
  {
    id: 'proposal',
    date: 'August 2024',
    title: 'The Proposal',
    description: 'During a sunset picnic overlooking the ocean, Eddie got down on one knee. Through happy tears, Yasmine said yes!',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-gold/20 text-gold',
    detail: "Eddie had been carrying the ring for three weeks waiting for the perfect moment.",
  },
  {
    id: 'wedding',
    date: 'July 2027',
    title: 'The Wedding',
    description: 'And now, we invite you to be part of the next chapter of our love story as we say "I do".',
    icon: <Camera className="w-5 h-5" />,
    color: 'bg-primary/15 text-primary',
    detail: "You are here! Thank you for being part of our story.",
  },
];

const InteractiveTimeline = () => {
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Interactive Timeline"
        description="Relive our love story with photos and videos - available on the wedding day!"
      />
    );
  }

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Interactive Timeline" />}

      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Our Journey Together"
            subtitle="Tap on any moment to learn more about our story."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto relative">
            {/* Vertical line */}
            <motion.div
              className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ originY: 0 }}
            />

            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative flex items-start gap-6 pl-2"
                >
                  {/* Icon dot */}
                  <motion.div
                    className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full ${event.color} flex items-center justify-center flex-shrink-0 ring-4 ring-background cursor-pointer`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  >
                    {event.icon}
                  </motion.div>

                  {/* Content card */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  >
                    <motion.div
                      className={`glass-card rounded-2xl p-5 transition-shadow ${
                        expandedId === event.id ? 'shadow-elegant ring-1 ring-primary/20' : ''
                      }`}
                      layout
                    >
                      <span className="inline-block px-3 py-1 bg-blush text-blush-foreground text-xs font-medium rounded-full mb-2">
                        {event.date}
                      </span>
                      <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {event.description}
                      </p>

                      <AnimatePresence>
                        {expandedId === event.id && event.detail && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-sm text-primary/80 italic">
                                {event.detail}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
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

export default InteractiveTimeline;
