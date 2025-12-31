import { motion } from 'framer-motion';
import { Gift, ExternalLink, Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';

const registries = [
  {
    name: 'Crate & Barrel',
    description: 'Home essentials and decor for our new life together.',
    link: 'https://www.crateandbarrel.com',
  },
  {
    name: 'Williams Sonoma',
    description: 'Kitchen must-haves for the home chef in us.',
    link: 'https://www.williams-sonoma.com',
  },
  {
    name: 'Amazon',
    description: 'A variety of items for our everyday life.',
    link: 'https://www.amazon.com',
  },
  {
    name: 'Honeymoon Fund',
    description: 'Help us create unforgettable memories on our honeymoon adventure.',
    link: '#',
  },
];

const Registry = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Gift Registry"
            subtitle="Your presence is the greatest gift, but if you'd like to give something more, here are some ideas."
          />
        </div>
      </section>

      {/* Message Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Gift className="w-12 h-12 text-primary mx-auto mb-6" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              Having you celebrate with us is truly the best gift we could receive. 
              However, if you wish to honor us with a gift, we have registered at 
              a few of our favorite stores. We are also contributing to our honeymoon 
              fund if you prefer to give towards our travel adventures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Registry Cards */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {registries.map((registry, index) => (
              <motion.div
                key={registry.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-8 text-center hover:shadow-elegant transition-all duration-300"
              >
                <h3 className="font-serif text-2xl text-foreground mb-3">
                  {registry.name}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {registry.description}
                </p>
                <Button variant="outline" asChild>
                  <a
                    href={registry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    View Registry
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <Heart className="w-8 h-8 text-primary mx-auto mb-6 animate-float" />
            <p className="font-display text-2xl text-foreground mb-4">
              Thank You
            </p>
            <p className="text-muted-foreground">
              We are so grateful for your love and support as we begin this new chapter together.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Registry;
