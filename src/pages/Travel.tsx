import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Hotel, Car, MapPin, ExternalLink, UtensilsCrossed,
  Wine, Waves, TreePine, Sun, Music, Palette, ShoppingBag,
  Clock, Calendar, Heart, Sparkles, ChevronRight, Star,
  Compass, Camera, Coffee, Sailboat, Landmark, GlassWater,
  Navigation, Shirt, Umbrella, SunMedium, Phone,
  ChevronDown
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Shared animation constants                                         */
/* ------------------------------------------------------------------ */

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const floatingParticles = [
  { className: 'top-16 left-[10%] w-2 h-2 bg-primary/30', duration: 4, y: -15, delay: 0 },
  { className: 'top-32 right-[15%] w-3 h-3 bg-accent/20', duration: 5, y: -20, delay: 1 },
  { className: 'bottom-20 left-[25%] w-1.5 h-1.5 bg-primary/25', duration: 3.5, y: -12, delay: 0.5 },
  { className: 'top-24 right-[30%] w-1 h-1 bg-gold/30', duration: 3, y: -10, delay: 2 },
] as const;

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const airports = [
  {
    name: 'South Bend International Airport (SBN)',
    distance: '~45 min drive',
    description: 'Closest regional airport with major carrier service.',
  },
  {
    name: 'Kalamazoo / Battle Creek Intl. (AZO)',
    distance: '~1 hr drive',
    description: 'Another convenient regional option.',
  },
  {
    name: 'Chicago O\'Hare Intl. (ORD)',
    distance: '~2 hr drive',
    description: 'Major hub with the most flight options.',
  },
  {
    name: 'Chicago Midway Intl. (MDW)',
    distance: '~1 hr 45 min drive',
    description: 'Great for Southwest Airlines travelers.',
  },
];

const hotels = [
  {
    name: 'The Boulevard Inn & Bistro',
    distance: '5 min from venue',
    description: 'Charming boutique hotel in downtown St. Joseph with lake views and on-site dining.',
    link: 'https://www.theboulevardinn.com',
    featured: true,
  },
  {
    name: 'Inn at Harbor Shores',
    distance: '10 min from venue',
    description: 'Upscale resort on the shores of Lake Michigan with a Jack Nicklaus golf course.',
    link: 'https://www.innatharborshores.com',
    featured: true,
  },
  {
    name: 'Courtyard by Marriott – Benton Harbor',
    distance: '8 min from venue',
    description: 'Reliable and comfortable option with modern amenities.',
    link: 'https://www.marriott.com',
    featured: false,
  },
  {
    name: 'Holiday Inn Express – St. Joseph',
    distance: '12 min from venue',
    description: 'Budget-friendly with complimentary breakfast and pool.',
    link: 'https://www.ihg.com',
    featured: false,
  },
];

type WeekendDay = 'thursday' | 'friday' | 'saturday' | 'sunday';

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

const weekendSchedule: Record<WeekendDay, { label: string; date: string; events: TimelineEvent[] }> = {
  thursday: {
    label: 'Thursday',
    date: 'July 1',
    events: [
      {
        time: 'Afternoon',
        title: 'Early Arrivals & Check-In',
        description: 'Settle in and explore the charming downtown areas of St. Joseph and Benton Harbor.',
        icon: <Hotel className="w-4 h-4" />,
      },
      {
        time: 'Evening',
        title: 'Welcome Drinks & Rehearsal Dinner',
        description: 'Rehearsal dinner for the wedding party and immediate family. Everyone else — join us for casual welcome drinks at a local spot!',
        icon: <Wine className="w-4 h-4" />,
        highlight: true,
      },
    ],
  },
  friday: {
    label: 'Friday',
    date: 'July 2',
    events: [
      {
        time: 'Morning',
        title: 'Relax & Recharge',
        description: 'Sleep in, grab brunch, or take a morning stroll along the bluff.',
        icon: <Coffee className="w-4 h-4" />,
      },
      {
        time: '4:00 PM',
        title: 'Wedding Ceremony',
        description: 'Blue Dress Barn, Benton Harbor. Doors open at 3:30 PM.',
        icon: <Heart className="w-4 h-4" />,
        highlight: true,
      },
      {
        time: '5:00 PM',
        title: 'Cocktail Hour & Reception',
        description: 'Dinner, dancing, and celebration under the stars at Blue Dress Barn.',
        icon: <Sparkles className="w-4 h-4" />,
        highlight: true,
      },
    ],
  },
  saturday: {
    label: 'Saturday',
    date: 'July 3',
    events: [
      {
        time: 'Morning',
        title: 'Farewell Brunch',
        description: 'Join us for a casual goodbye brunch before you head out. Location TBA.',
        icon: <Coffee className="w-4 h-4" />,
      },
      {
        time: 'Afternoon',
        title: 'Beach & Explore',
        description: 'Hit Silver Beach, wine-taste along the Lake Michigan Shore Wine Trail, or explore local galleries and shops.',
        icon: <Sun className="w-4 h-4" />,
      },
    ],
  },
  sunday: {
    label: 'Sunday',
    date: 'July 4',
    events: [
      {
        time: 'All Day',
        title: '4th of July Festivities',
        description: 'Stick around for fireworks over Lake Michigan! St. Joseph puts on a spectacular show.',
        icon: <Sparkles className="w-4 h-4" />,
        highlight: true,
      },
    ],
  },
};

type EntertainmentCategory = 'all' | 'beaches' | 'wine' | 'food' | 'outdoors' | 'arts' | 'shopping';

interface Entertainment {
  name: string;
  description: string;
  category: EntertainmentCategory;
  icon: React.ReactNode;
  tip?: string;
}

const entertainmentOptions: Entertainment[] = [
  {
    name: 'Silver Beach',
    description: 'Iconic white-sand beach on Lake Michigan with a historic carousel and splash pad nearby.',
    category: 'beaches',
    icon: <Waves className="w-5 h-5" />,
    tip: 'Arrive early on weekends for the best spot',
  },
  {
    name: 'Tiscornia Beach & North Pier',
    description: 'Walk the pier to the lighthouse for stunning panoramic lake views and photo ops.',
    category: 'beaches',
    icon: <Camera className="w-5 h-5" />,
    tip: 'Golden hour sunsets are unforgettable here',
  },
  {
    name: 'Lake Michigan Shore Wine Trail',
    description: 'A collection of award-winning wineries including Round Barn, Tabor Hill, and Domaine Berrien.',
    category: 'wine',
    icon: <Wine className="w-5 h-5" />,
    tip: 'Book tastings in advance for July weekend',
  },
  {
    name: 'Round Barn Winery & Estate',
    description: 'Beautiful grounds with wine, beer, and spirits tastings. Live music on summer weekends.',
    category: 'wine',
    icon: <Music className="w-5 h-5" />,
  },
  {
    name: 'Watermark Brewing',
    description: 'Craft brewery in a converted factory right on the river with great outdoor seating.',
    category: 'food',
    icon: <GlassWater className="w-5 h-5" />,
  },
  {
    name: 'The Livery',
    description: 'Legendary microbrewery in a historic building — try the cask-conditioned ales.',
    category: 'food',
    icon: <GlassWater className="w-5 h-5" />,
  },
  {
    name: 'Clementine\'s',
    description: 'Farm-to-table dining in a beautifully restored space. Seasonal menus highlight local produce.',
    category: 'food',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    tip: 'Make reservations well in advance',
  },
  {
    name: 'North Shore Inn Café',
    description: 'Cozy café perfect for a morning coffee and pastry before a day of exploring.',
    category: 'food',
    icon: <Coffee className="w-5 h-5" />,
  },
  {
    name: 'Warren Dunes State Park',
    description: 'Towering sand dunes with breathtaking lake views. Climb Tower Hill for a workout with a reward.',
    category: 'outdoors',
    icon: <TreePine className="w-5 h-5" />,
    tip: '240-foot dunes — wear sturdy shoes!',
  },
  {
    name: 'Sarett Nature Center',
    description: 'Five miles of trails through marshes, forests, and meadows. Great for birdwatching.',
    category: 'outdoors',
    icon: <Compass className="w-5 h-5" />,
  },
  {
    name: 'Harbor Shores Golf',
    description: 'Jack Nicklaus Signature course that has hosted PGA Senior events. Stunning lakeside holes.',
    category: 'outdoors',
    icon: <Sun className="w-5 h-5" />,
  },
  {
    name: 'Kayaking on the Paw Paw River',
    description: 'Rent kayaks or paddleboards for a peaceful float through scenic Southwest Michigan.',
    category: 'outdoors',
    icon: <Sailboat className="w-5 h-5" />,
  },
  {
    name: 'Krasl Art Center',
    description: 'Contemporary art gallery and sculpture garden overlooking the bluff in St. Joseph.',
    category: 'arts',
    icon: <Palette className="w-5 h-5" />,
  },
  {
    name: 'Water Street Glassworks',
    description: 'Watch live glassblowing demonstrations and browse beautiful handmade pieces.',
    category: 'arts',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    name: 'Box Factory for the Arts',
    description: 'Multi-use arts space with galleries, studios, and a community theater.',
    category: 'arts',
    icon: <Landmark className="w-5 h-5" />,
  },
  {
    name: 'Downtown St. Joseph',
    description: 'Charming streets lined with boutiques, antique shops, ice cream parlors, and waterfront dining.',
    category: 'shopping',
    icon: <ShoppingBag className="w-5 h-5" />,
    tip: 'Don\'t miss the bluff walk overlooking the lake',
  },
  {
    name: 'Benton Harbor Arts District',
    description: 'An emerging creative hub with local artisan shops, galleries, and unique finds.',
    category: 'arts',
    icon: <Palette className="w-5 h-5" />,
  },
];

const categoryConfig: { key: EntertainmentCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <Star className="w-4 h-4" /> },
  { key: 'beaches', label: 'Beaches', icon: <Waves className="w-4 h-4" /> },
  { key: 'wine', label: 'Wine & Spirits', icon: <Wine className="w-4 h-4" /> },
  { key: 'food', label: 'Food & Drink', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { key: 'outdoors', label: 'Outdoors', icon: <TreePine className="w-4 h-4" /> },
  { key: 'arts', label: 'Arts & Culture', icon: <Palette className="w-4 h-4" /> },
  { key: 'shopping', label: 'Shopping', icon: <ShoppingBag className="w-4 h-4" /> },
];

/** O(1) category label lookup instead of .find() in every render */
const categoryLabelMap = Object.fromEntries(
  categoryConfig.map((c) => [c.key, c.label])
) as Record<EntertainmentCategory, string>;

const WEEKEND_DAYS = Object.keys(weekendSchedule) as WeekendDay[];

const packingTips = [
  {
    icon: <SunMedium className="w-5 h-5" />,
    title: 'Sun Protection',
    items: 'Sunscreen, sunglasses, and a hat — Michigan summer sun is no joke near the lake.',
  },
  {
    icon: <Shirt className="w-5 h-5" />,
    title: 'Layers for Evening',
    items: 'Warm days, cooler lakeside evenings. Bring a light jacket or wrap for the reception.',
  },
  {
    icon: <Umbrella className="w-5 h-5" />,
    title: 'Just in Case',
    items: 'A small umbrella or rain jacket — Michigan weather can surprise you.',
  },
  {
    icon: <Waves className="w-5 h-5" />,
    title: 'Beach Ready',
    items: 'Swimsuit, towel, and sandals if you plan to hit Silver Beach or the dunes.',
  },
  {
    icon: <Camera className="w-5 h-5" />,
    title: 'Capture It All',
    items: 'Camera or charged phone — the sunsets and venue are incredibly photogenic.',
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: 'Stay Connected',
    items: 'Cell service can be spotty in rural areas. Download offline maps just in case.',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Travel = () => {
  const [activeDay, setActiveDay] = useState<WeekendDay>('friday');
  const [activeCategory, setActiveCategory] = useState<EntertainmentCategory>('all');

  const filteredEntertainment = useMemo(
    () =>
      activeCategory === 'all'
        ? entertainmentOptions
        : entertainmentOptions.filter((e) => e.category === activeCategory),
    [activeCategory]
  );

  const scrollToVenue = useCallback(() => {
    document.getElementById('venue-spotlight')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-28 md:py-40 romantic-gradient overflow-hidden">
        {/* Decorative floating elements */}
        {floatingParticles.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${p.className}`}
            animate={{ y: [0, p.y, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}

        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader
            title="Travel & Accommodations"
            subtitle="Everything you need to plan your weekend in beautiful Southwest Michigan."
            size="lg"
            ornament
          />
          <FadeIn delay={0.4}>
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-serif text-lg">Blue Dress Barn &middot; Benton Harbor, Michigan</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-serif text-lg">July 2, 2027</span>
              </div>
            </div>
          </FadeIn>

          {/* Scroll indicator */}
          <FadeIn delay={0.8}>
            <motion.div
              className="flex flex-col items-center mt-10 cursor-pointer"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              onClick={scrollToVenue}
            >
              <span className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-2">Explore</span>
              <ChevronDown className="w-5 h-5 text-primary/50" />
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Venue Spotlight */}
      <section id="venue-spotlight" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* Venue Info */}
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full mb-4 w-fit">
                      <Star className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs font-medium text-gold uppercase tracking-wider">The Venue</span>
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl text-foreground mb-3 gold-shimmer">
                      Blue Dress Barn
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Nestled on a 10-acre lavender farm in Benton Harbor, Blue Dress Barn is a
                      stunning restored barn venue surrounded by rolling fields and Michigan
                      countryside. Expect rustic elegance with breathtaking golden-hour light.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>5023 Territorial Rd, Benton Harbor, MI 49022</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>Ceremony at 4:00 PM &middot; Doors open 3:30 PM</span>
                      </div>
                    </div>
                    <Button variant="romantic" asChild className="w-fit">
                      <a
                        href="https://maps.google.com/?q=Blue+Dress+Barn+Benton+Harbor+MI"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  </div>

                  {/* Decorative Visual */}
                  <div className="relative bg-gradient-to-br from-primary/5 via-champagne/30 to-gold/10 min-h-[280px] md:min-h-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <motion.div
                        className="inline-block"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Heart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                      </motion.div>
                      <p className="font-display text-xl text-foreground/60 italic">
                        "A barn full of love,<br />lavender, and light"
                      </p>
                      <div className="decorative-line mx-auto mt-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Getting Here */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Getting Here"
            subtitle="Several airports serve Southwest Michigan — pick the one that works best for your trip."
            size="sm"
          />

          <StaggerContainer className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {airports.map((airport) => (
              <StaggerItem key={airport.name}>
                <div className="glass-card rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Plane className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-serif text-lg text-foreground leading-snug">{airport.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      <Car className="w-3 h-3" />
                      {airport.distance}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{airport.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Where to Stay */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Where to Stay"
            subtitle="We've handpicked hotels close to the venue for every budget."
            size="sm"
          />

          <StaggerContainer className="grid gap-6 max-w-3xl mx-auto">
            {hotels.map((hotel) => (
              <StaggerItem key={hotel.name}>
                <div
                  className={cn(
                    'rounded-2xl p-6 transition-all duration-300 hover:shadow-lg',
                    hotel.featured
                      ? 'bg-primary/5 border-2 border-primary/30'
                      : 'glass-card'
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      {hotel.featured && (
                        <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full mb-2">
                          Recommended
                        </span>
                      )}
                      <h4 className="font-serif text-xl text-foreground mb-1">{hotel.name}</h4>
                      <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {hotel.distance}
                      </p>
                      <p className="text-muted-foreground">{hotel.description}</p>
                    </div>
                    <Button
                      variant={hotel.featured ? 'romantic' : 'outline'}
                      className="flex-shrink-0"
                      asChild
                    >
                      <a href={hotel.link} target="_blank" rel="noopener noreferrer">
                        Book Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Transportation */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Getting Around"
            subtitle="Tips for navigating Southwest Michigan during the weekend."
            size="sm"
          />

          <FadeIn>
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-serif text-lg text-foreground">Rental Car</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  We recommend renting a car for the most flexibility exploring Southwest Michigan.
                  Parking is available at Blue Dress Barn and all recommended hotels.
                </p>
              </div>
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-serif text-lg text-foreground">Rideshare</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Uber and Lyft are available in the area, though wait times can be longer
                  in rural spots. We recommend having a backup plan for late-night rides.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Weekend at a Glance — Interactive Timeline */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Your Weekend at a Glance"
            subtitle="Make the most of your trip — here's what the weekend looks like."
            size="sm"
          />

          {/* Day Selector Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm border border-border/50">
              {WEEKEND_DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={cn(
                    'relative px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap',
                    activeDay === day
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {activeDay === day && (
                    <motion.div
                      layoutId="activeDay"
                      className="absolute inset-0 bg-primary rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex flex-col items-center leading-tight">
                    <span>{weekendSchedule[day].label}</span>
                    <span className="text-[10px] opacity-75">{weekendSchedule[day].date}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Content */}
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                className="relative"
              >
                {/* Vertical line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

                <div className="space-y-8">
                  {weekendSchedule[activeDay].events.map((event, index) => (
                    <motion.div
                      key={event.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.12, duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="flex gap-5"
                    >
                      {/* Dot */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                            event.highlight
                              ? 'bg-primary border-primary text-white'
                              : 'bg-background border-primary/30 text-primary'
                          )}
                        >
                          {event.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        className={cn(
                          'flex-1 rounded-2xl p-5 transition-all',
                          event.highlight
                            ? 'bg-primary/5 border border-primary/20'
                            : 'glass-card'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary uppercase tracking-wider">
                            {event.time}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg text-foreground mb-1">{event.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Entertainment & Sightseeing */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Entertainment & Sightseeing"
            subtitle="Southwest Michigan is full of hidden gems. Here are our favorites for making it a full weekend."
            size="sm"
          />

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              {categoryConfig.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border',
                    activeCategory === cat.key
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-background/80 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground'
                  )}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredEntertainment.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.4,
                      ease: EASE_OUT_EXPO,
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="glass-card rounded-2xl p-6 group cursor-default"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-foreground leading-snug">{item.name}</h4>
                        <span className="text-[11px] font-medium text-primary/70 uppercase tracking-wider">
                          {categoryLabelMap[item.category]}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                      {item.description}
                    </p>
                    {item.tip && (
                      <div className="flex items-start gap-1.5 mt-3 pt-3 border-t border-border/50">
                        <ChevronRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-primary/80 italic">{item.tip}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Packing Tips */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Packing Tips"
            subtitle="A Michigan summer wedding weekend — here's what to toss in your bag."
            size="sm"
          />

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {packingTips.map((tip) => (
              <StaggerItem key={tip.title}>
                <div className="glass-card rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-champagne/50 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-champagne transition-colors">
                      {tip.icon}
                    </div>
                    <h4 className="font-serif text-lg text-foreground">{tip.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{tip.items}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Local Tip / CTA */}
      <section className="py-16 md:py-24 romantic-gradient">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Local Tip</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                4th of July on Lake Michigan
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our wedding weekend coincides with Independence Day! Stick around on Sunday to
                enjoy one of the best fireworks shows in Michigan right over the lake in
                St. Joseph. It's the perfect way to cap off the celebration.
              </p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-serif italic">We can't wait to celebrate with you</span>
                <Heart className="w-4 h-4 text-primary" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </Layout>
  );
};

export default Travel;
