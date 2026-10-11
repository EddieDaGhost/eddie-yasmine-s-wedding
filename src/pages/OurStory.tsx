import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FadeIn } from '@/components/animation';
import coupleImage from '@/assets/couple-story.jpg';
import { useAllContent } from "@/hooks/useContent";

const timelineEvents = [
  {
    date: 'January 2014',
    title: 'The First Spark',
    description:
      "We caught each other’s eye across the room at Eddie’s fraternity house on the night of his fraternity initiation. Little did we know that one night would be the beginning of our story!",
  },
  {
    date: 'Spring 2014',
    title: 'College Sweethearts in the Making',
    description:
      "Between studying at the library, grabbing food, partying, and hanging out in each other’s dorms with friends, we quickly became part of each other’s everyday lives. What started with a little flirting soon turned into something more.",
  },
  {
    date: 'July 2014',
    title: 'Officially Us',
    description:
      "After a date at Applebee’s, Eddie drove Yasmine back home and asked her to be his girlfriend. And just like that, we officially began our journey together! 🤗",
  },
  {
    date: 'August 2018',
    title: 'Our First Place',
    description:
      "After sharing an apartment throughout college, we moved into our first official apartment together in Pilsen after graduation. We were ready to take on the next chapter of adulthood, one adventure at a time!",
  },
  {
    date: 'May 2021',
    title: 'Home Sweet Home',
    description:
      "We bought our first home together and started building a space of our own! Just a month later, we adopted our two boys, adding even more love (and a little chaos) to our family.",
  },
  {
    date: 'April 2023',
    title: 'The Flock Grows',
    description:
      "As if four cats weren’t enough, we added a chicken coop and a few feathered friends to the mix! Between family gatherings, sporting events, road trips, and everyday life, our little family and our adventures just kept growing.",
  },
  {
    date: 'September 2024',
    title: 'A Proposal in Paris',
    description:
      "We celebrated our 10-year anniversary with a trip to Europe, and Eddie had one more surprise up his sleeve. On our last night in Paris, before heading to Brussels, he proposed by the Seine River overlooking the Eiffel Tower and even arranged for a photographer to capture the moment. It was the perfect start to our forever!",
  },
  {
    date: 'July 2, 2027',
    title: 'The Correas!',
    description:
      "After more than 13 years of memories, adventures, and growing up together, we’re finally getting married! We can’t wait to celebrate this next chapter with our favorite people in beautiful Michigan. The countdown to forever is on!",
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