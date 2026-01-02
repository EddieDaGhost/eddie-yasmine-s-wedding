import { motion } from 'framer-motion';
import { MapPin, Clock, Shirt, Utensils, Music, Camera } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { useContent } from "@/lib/content/useContent";

// Map icon names from CMS to actual Lucide icons
const iconMap: Record<string, any> = {
  Shirt,
  Utensils,
  Music,
  Camera,
};

const EventDetails = () => {
  const { data, isLoading } = useContent();

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

  // Venue
  const venueName =
    data?.find((c) => c.key === "eventdetails_venue_name")?.value || "The Grand Estate";
  const venueAddress =
    data?.find((c) => c.key === "eventdetails_venue_address")?.value ||
    "1234 Vineyard Lane<br />Napa Valley, California 94558";
  const venueMap =
    data?.find((c) => c.key === "eventdetails_venue_map_embed")?.value ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.9558155896756!2d-122.28686722424619!3d38.29764397178591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDE3JzUxLjUiTiAxMjLCsDE3JzAzLjkiVw!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus";
  const venueDirections =
    data?.find((c) => c.key === "eventdetails_venue_directions_link")?.value ||
    "https://maps.google.com/?q=Napa+Valley+California";

  // Schedule
  const scheduleJson = data?.find((c) => c.key === "eventdetails_schedule")?.value;
  let scheduleEvents: { time: string; event: string; description: string }[] = [];
  try {
    scheduleEvents = scheduleJson ? JSON.parse(scheduleJson) : [];
  } catch {}

  // Info Cards
  const infoJson = data?.find((c) => c.key === "eventdetails_info")?.value;
  let infoCards: { icon: string; title: string; description: string }[] = [];
  try {
    infoCards = infoJson ? JSON.parse(infoJson) : [];
  } catch {}

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
                    Blue Dress Barn
                  </h3>
                  <p className="text-muted-foreground">
                    5815 W Napier Ave<br />
                    Benton Harbor, Michigan 49022
                  </p>
                </div>
              </div>
              
              {/* Map */}
              <div className="aspect-video rounded-2xl bg-muted mb-6 overflow-hidden">
                <iframe
                  title="Blue Dress Barn - Wedding Venue Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2967.8544433850236!2d-86.44476492359373!3d42.07844497122837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8810430a6f2f9f5f%3A0x5a6e5b9c6b3b8b8b!2sBlue%20Dress%20Barn!5e0!3m2!1sen!2sus!4v1704123456789!5m2!1sen!2sus"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <Button variant="outline" className="w-full md:w-auto" asChild>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Blue+Dress+Barn,+5815+W+Napier+Ave,+Benton+Harbor,+MI+49022"
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