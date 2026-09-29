import { motion } from 'framer-motion';
import { MapPin, Clock, Shirt, Utensils, Music, Camera } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { useAllContent } from "@/hooks/useContent";
import { VENUE, CEREMONY } from '@/lib/weddingDetails';
import { sanitizeHtml } from '@/lib/sanitize';

// Map icon names from CMS to actual Lucide icons
const iconMap: Record<string, any> = {
  Shirt,
  Utensils,
  Music,
  Camera,
};

const EventDetails = () => {
  const { data, isLoading } = useAllContent();

  if (isLoading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <p>Loading content...</p>
          </div>
        </section>
      </Layout>
    );
  }

  // Hero
  const title = data?.find((c) => c.key === "eventdetails_title")?.value || "Event Details";
  const subtitle =
    data?.find((c) => c.key === "eventdetails_subtitle")?.value ||
    "Everything you need to know about our wedding day celebration.";

  // Venue — falls back to the shared constants so the page is correct even
  // with an empty content table.
  const venueName =
    data?.find((c) => c.key === "eventdetails_venue_name")?.value || VENUE.name;
  const venueAddress =
    data?.find((c) => c.key === "eventdetails_venue_address")?.value ||
    `${VENUE.street}<br />${VENUE.cityStateZip}`;
  const venueMap =
    data?.find((c) => c.key === "eventdetails_venue_map_embed")?.value || VENUE.mapEmbedUrl;
  const venueDirections =
    data?.find((c) => c.key === "eventdetails_venue_directions_link")?.value ||
    VENUE.directionsUrl;

  // Schedule
  const scheduleJson = data?.find((c) => c.key === "eventdetails_schedule")?.value;
  // Without a fallback an empty content table leaves the schedule heading over
  // blank space — and no ceremony time anywhere on the page.
  const defaultSchedule = [
    { time: CEREMONY.doorsLabel, event: 'Doors Open', description: 'Arrive, find your seat, and settle in.' },
    { time: CEREMONY.timeLabel, event: 'Ceremony', description: `${VENUE.name} — please be seated beforehand.` },
    { time: '5:00 – 6:00 PM', event: 'Cocktail Hour', description: "Drinks and hors d'oeuvres while we take photos." },
    { time: '6:30 – 7:30 PM', event: 'Dinner', description: 'Dinner is served, followed by toasts.' },
    { time: '11:00 PM', event: 'Music Ends', description: 'The last song of the night.' },
  ];
  let scheduleEvents: { time: string; event: string; description: string }[] = [];
  try {
    scheduleEvents = scheduleJson ? JSON.parse(scheduleJson) : [];
  } catch {}
  if (scheduleEvents.length === 0) scheduleEvents = defaultSchedule;

  // Info Cards
  const infoJson = data?.find((c) => c.key === "eventdetails_info")?.value;
  const defaultInfo = [
    { icon: 'Shirt', title: 'Dress Code', description: 'Semi-formal. Parts of the venue are outdoors and grassy, so plan your footwear accordingly.' },
    { icon: 'Utensils', title: 'Food & Drink', description: 'Dinner and drinks are provided. Tell us about dietary needs when you RSVP.' },
    { icon: 'Music', title: 'Dancing', description: "There's a playlist in the works — request a song with your RSVP." },
    { icon: 'Camera', title: 'Photos', description: 'Please keep phones away during the ceremony. Snap away at the reception.' },
  ];
  let infoCards: { icon: string; title: string; description: string }[] = [];
  try {
    infoCards = infoJson ? JSON.parse(infoJson) : [];
  } catch {}
  if (infoCards.length === 0) infoCards = defaultInfo;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader title={title} subtitle={subtitle} />
        </div>
      </section>

      {/* Venue Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-8 md:p-12"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-foreground mb-2">
                    {venueName}
                  </h3>
                  <p
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(venueAddress) }}
                  />
                </div>
              </div>
              
              {/* Map */}
              <style>{`
                .embed-map-container {
                  position: relative;
                  width: 100%;
                  max-width: 600px;
                  height: 400px;
                  border-radius: 1rem;
                  overflow: hidden;
                  background: #f3f4f6;
                }
                .embed-map-frame {
                  width: 100% !important;
                  height: 100% !important;
                  border: none !important;
                }
              `}</style>
              <div className="embed-map-container mb-6">
                <iframe
                  title={`${venueName} - Wedding Venue Location`}
                  className="embed-map-frame"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={venueMap}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <Button variant="outline" className="w-full md:w-auto" asChild>
                <a
                  href={venueDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h3 className="font-display text-3xl text-foreground">Schedule of Events</h3>
            </div>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {scheduleEvents.map((item, index) => (
              <motion.div
                key={item.event}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-6 last:mb-0"
              >
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="font-serif text-lg text-primary">{item.time}</span>
                </div>
                <div className="relative flex-1 pb-6 border-l-2 border-primary/20 pl-6 last:border-transparent">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
                  <h4 className="font-serif text-lg text-foreground mb-1">{item.event}</h4>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dress Code & Info Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {infoCards.map((item, index) => {
              const Icon = iconMap[item.icon] || Shirt;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-serif text-lg text-foreground mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventDetails;