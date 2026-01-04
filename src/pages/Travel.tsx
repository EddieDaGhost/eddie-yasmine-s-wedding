import { motion } from 'framer-motion';
import { Plane, Hotel, Car, MapPin, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { useAllContent } from "@/hooks/useContent";

const Travel = () => {
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
  const title = data?.find((c) => c.key === "travel_title")?.value || "Travel & Accommodations";
  const subtitle =
    data?.find((c) => c.key === "travel_subtitle")?.value ||
    "Everything you need to plan your trip to our celebration.";

  // Airports
  const airportsJson = data?.find((c) => c.key === "travel_airports")?.value;
  let airports: { name: string; distance: string }[] = [];
  try {
    airports = airportsJson ? JSON.parse(airportsJson) : [];
  } catch {}

  // Hotels
  const hotelsJson = data?.find((c) => c.key === "travel_hotels")?.value;
  let hotels: { name: string; distance: string; description: string; link: string; featured: boolean }[] = [];
  try {
    hotels = hotelsJson ? JSON.parse(hotelsJson) : [];
  } catch {}

  // Transportation
  const transportation =
    data?.find((c) => c.key === "travel_transportation")?.value ||
    "We will be providing shuttle service between The Vineyard Inn and the venue throughout the evening. The shuttle will run every 30 minutes from 2:30 PM until midnight. Uber and Lyft are also available in the Napa Valley area.";

  // Activities
  const activitiesJson = data?.find((c) => c.key === "travel_activities")?.value;
  let activities: string[] = [];
  try {
    activities = activitiesJson ? JSON.parse(activitiesJson) : [];
  } catch {}

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader title={title} subtitle={subtitle} />
        </div>
      </section>

      {/* Airports Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 justify-center mb-12"
          >
            <Plane className="w-6 h-6 text-primary" />
            <h3 className="font-display text-2xl text-foreground">Getting Here</h3>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {airports.map((airport, index) => (
              <motion.div
                key={airport.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <h4 className="font-serif text-lg text-foreground mb-2">{airport.name}</h4>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {airport.distance}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 justify-center mb-12"
          >
            <Hotel className="w-6 h-6 text-primary" />
            <h3 className="font-display text-2xl text-foreground">Where to Stay</h3>
          </motion.div>

          <div className="grid gap-6 max-w-3xl mx-auto">
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl p-6 ${
                  hotel.featured
                    ? "bg-primary/5 border-2 border-primary/30"
                    : "glass-card"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    {hotel.featured && (
                      <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full mb-2">
                        Recommended
                      </span>
                    )}
                    <h4 className="font-serif text-xl text-foreground mb-1">{hotel.name}</h4>
                    <p className="text-muted-foreground text-sm mb-2">{hotel.distance}</p>
                    <p className="text-muted-foreground">{hotel.description}</p>
                  </div>
                  <Button
                    variant={hotel.featured ? "romantic" : "outline"}
                    className="flex-shrink-0"
                    asChild
                  >
                    <a href={hotel.link} target="_blank" rel="noopener noreferrer">
                      Book Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transportation Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 justify-center mb-12"
          >
            <Car className="w-6 h-6 text-primary" />
            <h3 className="font-display text-2xl text-foreground">Transportation</h3>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                {transportation}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Things to Do Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="font-display text-2xl text-foreground mb-4">While You're Here</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Make a weekend of it! Napa Valley offers world-class wine tasting, beautiful
              hiking trails, hot air balloon rides, and exceptional dining.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {activities.map((activity, index) => (
              <motion.div
                key={activity}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <h4 className="font-serif text-lg text-foreground">{activity}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Travel;