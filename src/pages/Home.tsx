import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { WeddingCard, WeddingCardHeader, WeddingCardTitle, WeddingCardDescription } from '@/components/shared/WeddingCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animation';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import heroImage from '@/assets/hero-wedding.jpg';

const quickLinks = [
  { 
    title: 'Event Details', 
    desc: 'Schedule & venue information', 
    link: '/event-details',
    icon: Calendar,
  },
  { 
    title: 'Travel & Stay', 
    desc: 'Hotels and transportation', 
    link: '/travel',
    icon: MapPin,
  },
  { 
    title: 'Registry', 
    desc: 'Gift registry links', 
    link: '/registry',
    icon: Heart,
  },
];

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            src={heroImage}
            alt="Eddie and Yasmine Wedding"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <div className="max-w-4xl mx-auto">
            {/* Announcement */}
            <FadeIn delay={0.1}>
              <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6">
                We're Getting Married
              </p>
            </FadeIn>

            {/* Names */}
            <FadeIn delay={0.2}>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 tracking-tight">
                Eddie <span className="text-primary">&</span> Yasmine
              </h1>
            </FadeIn>

            {/* Date */}
            <FadeIn delay={0.3}>
              <div className="flex items-center justify-center gap-4 text-muted-foreground mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-serif text-xl md:text-2xl">July 2nd, 2027</span>
              </div>
            </FadeIn>

            {/* Location */}
            <FadeIn delay={0.4}>
              <div className="flex items-center justify-center gap-4 text-muted-foreground mb-12">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-serif text-lg">The Grand Estate, California</span>
              </div>
            </FadeIn>

            {/* Countdown */}
            <FadeIn delay={0.5}>
              <div className="mb-12">
                <CountdownTimer />
              </div>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/rsvp">
                  <Button variant="hero" size="xl" className="min-w-[180px]">
                    RSVP Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/our-story">
                  <Button variant="hero-outline" size="xl" className="min-w-[180px]">
                    Our Story
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Info Section */}
      <Section variant="gradient" spacing="lg">
        <Container size="md">
          <FadeIn>
            <div className="text-center mb-16">
              <Heart className="w-8 h-8 text-primary mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                Join Us for Our Celebration
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
                We are delighted to invite you to share in our joy as we celebrate our love 
                and commitment to each other.
              </p>
            </div>
          </FadeIn>
        </Container>

        {/* Quick Links Grid */}
        <Container size="lg">
          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((item) => (
              <StaggerItem key={item.title}>
                <Link to={item.link} className="block group">
                  <WeddingCard variant="glass" hoverable className="text-center h-full">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <WeddingCardHeader>
                      <WeddingCardTitle className="text-lg group-hover:text-primary transition-colors">
                        {item.title}
                      </WeddingCardTitle>
                      <WeddingCardDescription>
                        {item.desc}
                      </WeddingCardDescription>
                    </WeddingCardHeader>
                  </WeddingCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>
    </Layout>
  );
};

export default Home;
