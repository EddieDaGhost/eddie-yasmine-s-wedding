import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import coupleImage from '@/assets/couple-story.jpg';

const timelineEvents = [
  {
    date: 'September 2019',
    title: 'The First Meeting',
    description: 'We met at a mutual friend\'s birthday party. Eddie spilled coffee on Yasmine\'s dress, and somehow that clumsy moment became the beginning of our forever.',
  },
  {
    date: 'December 2019',
    title: 'The First Date',
    description: 'After weeks of texting, Eddie finally asked Yasmine out for dinner. We talked for hours and closed down the restaurant. Neither of us wanted the night to end.',
  },
  {
    date: 'February 2020',
    title: 'Making It Official',
    description: 'Under a starlit sky, we decided to officially become a couple. Little did we know this was just the beginning of our greatest adventure.',
  },
  {
    date: 'March 2021',
    title: 'Moving In Together',
    description: 'We took the leap and moved into our first apartment together. Learning to share a space taught us patience, compromise, and the true meaning of partnership.',
  },
  {
    date: 'August 2024',
    title: 'The Proposal',
    description: 'During a sunset picnic at our favorite spot overlooking the ocean, Eddie got down on one knee. Through happy tears, Yasmine said yes!',
  },
  {
    date: 'July 2027',
    title: 'The Wedding',
    description: 'And now, we invite you to be part of the next chapter of our love story as we say "I do" surrounded by the people we love most.',
  },
];

const OurStory = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <SectionHeader
              title="Our Love Story"
              subtitle="From a chance meeting to forever after, here's how our journey unfolded."
            />

            {/* Couple Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-12 mb-16 max-w-md mx-auto"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl -rotate-3" />
                <img
                  src={coupleImage}
                  alt="Eddie and Yasmine"
                  className="relative rounded-2xl shadow-elegant w-full aspect-square object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />

              {/* Events */}
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.date}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-start gap-6 mb-12 md:mb-16 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full ring-4 ring-background" />

                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <span className="inline-block px-4 py-1 bg-blush text-blush-foreground text-sm font-medium rounded-full mb-3">
                      {event.date}
                    </span>
                    <h3 className="font-serif text-2xl text-foreground mb-3">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="font-display text-2xl md:text-3xl text-foreground italic leading-relaxed">
              "Whatever our souls are made of, his and mine are the same."
            </p>
            <footer className="mt-6 text-muted-foreground">
              — Emily Brontë
            </footer>
          </motion.blockquote>
        </div>
      </section>
    </Layout>
  );
};

export default OurStory;
