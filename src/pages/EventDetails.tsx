import { motion } from 'framer-motion';
import { MapPin, Clock, Shirt, Utensils, Music, Camera } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';

const scheduleEvents = [
  { time: '3:00 PM', event: 'Guest Arrival', description: 'Welcome drinks and seating' },
  { time: '4:00 PM', event: 'Ceremony', description: 'Exchange of vows in the garden' },
  { time: '5:00 PM', event: 'Cocktail Hour', description: 'Hors d\'oeuvres and mingling' },
  { time: '6:30 PM', event: 'Reception', description: 'Dinner, toasts, and celebration' },
  { time: '8:00 PM', event: 'First Dance', description: 'Eddie & Yasmine take the floor' },
  { time: '8:30 PM', event: 'Dancing & Party', description: 'Let\'s celebrate together!' },
  { time: '11:00 PM', event: 'Sparkler Send-Off', description: 'A magical farewell' },
];

const EventDetails = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Event Details"
            subtitle="Everything you need to know about our wedding day celebration."
          />
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
                    The Grand Estate
                  </h3>
                  <p className="text-muted-foreground">
                    1234 Vineyard Lane<br />
                    Napa Valley, California 94558
                  </p>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="aspect-video rounded-2xl bg-muted mb-6 overflow-hidden">
                <iframe
                  title="Wedding Venue Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.9558155896756!2d-122.28686722424619!3d38.29764397178591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDE3JzUxLjUiTiAxMjLCsDE3JzAzLjkiVw!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              
              <Button variant="outline" className="w-full md:w-auto" asChild>
                <a
                  href="https://maps.google.com/?q=Napa+Valley+California"
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
            {[
              { icon: Shirt, title: 'Dress Code', description: 'Formal / Black Tie Optional' },
              { icon: Utensils, title: 'Dining', description: 'Plated dinner with vegetarian options' },
              { icon: Music, title: 'Entertainment', description: 'Live band and DJ' },
              { icon: Camera, title: 'Photography', description: 'Unplugged ceremony, please' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-serif text-lg text-foreground mb-2">{item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventDetails;
