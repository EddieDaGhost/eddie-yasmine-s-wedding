import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FadeIn } from '@/components/animation';
import coupleImage from '@/assets/couple-story.jpg';
import { useAllContent } from "@/hooks/useContent";

const timelineEvents = [
  {
    date: 'September 2019',
    title: 'The First Meeting',
    description:
      "We met at a mutual friend's birthday party. Eddie spilled coffee on Yasmine's dress, and somehow that clumsy moment became the beginning of our forever.",
  },
  {
    date: 'December 2019',
    title: 'The First Date',
    description:
      'After weeks of texting, Eddie finally asked Yasmine out for dinner. We talked for hours and closed down the restaurant.',
  },
  {
    date: 'February 2020',
    title: 'Making It Official',
    description:
      'Under a starlit sky, we decided to officially become a couple. Little did we know this was just the beginning.',
  },
  {
    date: 'March 2021',
    title: 'Moving In Together',
    description:
      'We took the leap and moved into our first apartment together. Learning to share a space taught us the true meaning of partnership.',
  },
  {
    date: 'August 2024',
    title: 'The Proposal',
    description:
      'During a sunset picnic overlooking the ocean, Eddie got down on one knee. Through happy tears, Yasmine said yes!',
  },
  {
    date: 'July 2027',
    title: 'The Wedding',
    description:
      'And now, we invite you to be part of the next chapter of our love story as we say "I do".',
  },
];

const OurStory = () => {
  const { data, isLoading } = useAllContent();

  if (isLoading) {
    return (
      <Layout>
        <Section>
          <Container>
            <p>Loading content...</p>
          </Container>
        </Section>
      </Layout>
    );
  }

  // Pull CMS content
  const storyTitle = data?.find((c) => c.key === "our_story_title")?.value || "Our Love Story";
  const storySubtitle = data?.find((c) => c.key === "our_story_subtitle")?.value ||
    "From a chance meeting to forever after, here's how our journey unfolded.";
  const storyQuote = data?.find((c) => c.key === "our_story_quote")?.value ||
    `"Whatever our souls are made of, his and mine are the same."`;
  const storyQuoteAuthor = data?.find((c) => c.key === "our_story_quote_author")?.value ||
    "Emily Brontë";

  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" spacing="lg">
        <Container size="md">
          <SectionHeader title={storyTitle} subtitle={storySubtitle} />

          {/* Couple Image */}
          <FadeIn delay={0.2}>
            <div className="max-w-sm mx-auto">
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 bg-primary/10 rounded-3xl"
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: -3 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
                <img
                  src={coupleImage}
                  alt="Eddie and Yasmine"
                  className="relative rounded-2xl shadow-elegant w-full aspect-square object-cover"
                />
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Timeline Section */}
      <Section spacing="lg">
        <Container size="md">
          <div className="relative">
            {/* Vertical Line */}
            <motion.div
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ originY: 0 }}
            />

            {/* Events */}
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.date}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex items-start gap-6 mb-12 md:mb-16 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <motion.div
                  className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full ring-4 ring-background z-10"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                />

                {/* Content */}
                <div
                  className={`ml-12 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}
                >
                  <motion.span
                    className="inline-block px-4 py-1.5 bg-blush text-blush-foreground text-sm font-medium rounded-full mb-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    {event.date}
                  </motion.span>
                  <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Quote Section */}
      <Section variant="muted" spacing="md">
        <Container size="md">
          <FadeIn>
            <blockquote className="text-center">
              <p className="font-display text-2xl md:text-3xl text-foreground italic leading-relaxed">
                {storyQuote}
              </p>
              <footer className="mt-6 text-muted-foreground">— {storyQuoteAuthor}</footer>
            </blockquote>
          </FadeIn>
        </Container>
      </Section>
    </Layout>
  );
};

export default OurStory;