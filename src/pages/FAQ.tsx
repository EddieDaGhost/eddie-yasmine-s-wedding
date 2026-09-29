import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAllContent } from "@/hooks/useContent";
import { HOTEL_BLOCK } from '@/lib/hotelBlock';
import { VENUE, CONTACT, RSVP_DEADLINE } from '@/lib/weddingDetails';

const FAQ = () => {
  const { data, isLoading } = useAllContent();

  // Questions carrying an `id` can be linked to directly — /faq#shuttle opens
  // and scrolls to the shuttle question rather than dropping the reader at the
  // top of a long list.
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    setOpenItem(hash);
    // Wait for the accordion to expand before scrolling to it.
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
    return () => window.clearTimeout(t);
  }, [isLoading]);

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

  // Pull CMS content
  const faqTitle = data?.find((c) => c.key === "faq_title")?.value || "Frequently Asked Questions";
  const faqSubtitle =
    data?.find((c) => c.key === "faq_subtitle")?.value ||
    "Everything you need to know about our wedding day.";

  // Pulled from the shared block data so the FAQ can't drift from the Travel page.
  const thursdayRate =
    HOTEL_BLOCK.rates.find((r) => r.night === 'Thursday')?.price ?? '';
  const weekendRate =
    HOTEL_BLOCK.rates.find((r) => r.night === 'Friday')?.price ?? '';

  const inlineLink = (to: string, label: string) => (
    <Link to={to} className="text-primary hover:underline font-medium transition-colors">
      {label}
    </Link>
  );

  // Default FAQ items — answers support React nodes for internal links
  const defaultFaqItems: { question: string; answer: React.ReactNode; id?: string }[] = [
    {
      question: "Can I bring a plus one or additional guests?",
      answer:
        "Due to limited venue capacity, we are only able to accommodate guests who are specifically listed on your invitation. If your invitation includes a plus one, it will be clearly noted. We appreciate your understanding and hope you will still celebrate with us!",
    },
    {
      question: "Are children welcome at the wedding?",
      answer:
        "While we love your little ones, our wedding will be an adults-only celebration. We hope this gives you a chance to enjoy a night out! We appreciate your understanding.",
    },
    {
      question: "When should I RSVP by?",
      answer: (
        <>
          Please RSVP by {RSVP_DEADLINE.labelLong} so we can finalize our guest count, seating arrangements, and catering. You can {inlineLink('/rsvp', 'RSVP directly through our website')}.
        </>
      ),
    },
    {
      question: "Where is the wedding being held?",
      answer: (
        <>
          Our ceremony and reception will both take place at {VENUE.name}, located at {VENUE.full}. Please visit our {inlineLink('/travel', 'Travel page')} for directions and nearby hotel recommendations.
        </>
      ),
    },
    {
      question: "Is there a hotel room block?",
      answer: (
        <>
          Yes — we've reserved a block at the {HOTEL_BLOCK.name}, about{' '}
          {HOTEL_BLOCK.distance.replace(' from venue', '')} from the venue. Group
          rates are {thursdayRate} on Thursday and {weekendRate} Friday through
          Sunday.{' '}
          <a
            href={HOTEL_BLOCK.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium transition-colors"
          >
            Reserve your room here
          </a>
          {' '}by {HOTEL_BLOCK.bookByLabel} to get the group rate. We'd suggest booking
          as early as you can — our wedding falls on 4th of July weekend, so rooms in
          the area fill up fast. See our {inlineLink('/travel', 'Travel page')} for
          other nearby hotels.
        </>
      ),
    },
    {
      id: 'shuttle',
      question: "Is there a shuttle to the venue?",
      answer: (
        <>
          Yes — we're providing a shuttle running between the {HOTEL_BLOCK.name} and{' '}
          {VENUE.name}, both to the ceremony and back afterward. It's another good
          reason to book inside the room block. Exact pickup times are still being
          worked out and we'll share them here closer to the day.
        </>
      ),
    },
    {
      question: "What is the dress code?",
      answer: (
        <>
          We kindly ask guests to wear semi-formal attire. Visit our {inlineLink('/dress-code', 'Dress Code page')} for the full color palette guide and a lookbook. Please keep in mind that parts of the venue have outdoor and grassy areas, so plan your footwear accordingly.
        </>
      ),
    },
    {
      question: "What time should I arrive?",
      answer: (
        <>
          We recommend arriving at least 30 minutes before the ceremony start time to get settled. Please check our {inlineLink('/event-details', 'Event Details page')} for the full schedule.
        </>
      ),
    },
    {
      question: "Will the wedding be indoors or outdoors?",
      answer:
        "Blue Dress Barn offers both beautiful indoor and outdoor spaces. Portions of the celebration may take place outdoors, so please dress accordingly. In the event of inclement weather, everything will move indoors.",
    },
    {
      question: "Is there parking at the venue?",
      answer:
        "Yes, Blue Dress Barn has complimentary on-site parking available for all guests.",
    },
    {
      question: "Can I take photos during the ceremony?",
      answer:
        "We kindly ask that you keep phones and cameras put away during our ceremony so that everyone can be fully present. Our photographer will capture every moment! You are welcome to take photos during the reception and we would love for you to share them.",
    },
    {
      question: "Will there be food and drinks?",
      answer: (
        <>
          Yes! A full dinner and drinks will be provided. If you have dietary restrictions or allergies, please let us know when you {inlineLink('/rsvp', 'RSVP')} so we can accommodate you.
        </>
      ),
    },
    {
      question: "What if I need to update my RSVP?",
      answer:
        `If your plans change, please reach out to us as soon as possible at ${CONTACT.email} so we can update our records.`,
    },
  ];

  // FAQ items stored as JSON in the content table
  const faqJson = data?.find((c) => c.key === "faq_items")?.value;
  let cmsItems: { question: string; answer: string }[] = [];
  try {
    cmsItems = faqJson ? JSON.parse(faqJson) : [];
  } catch {
    cmsItems = [];
  }

  const faqItems: { question: string; answer: React.ReactNode; id?: string }[] =
    cmsItems.length > 0 ? cmsItems : defaultFaqItems;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader title={faqTitle} subtitle={faqSubtitle} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion
              type="single"
              collapsible
              className="space-y-4"
              value={openItem}
              onValueChange={setOpenItem}
            >
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem
                    id={item.id}
                    value={item.id ?? `item-${index}`}
                    className="glass-card rounded-xl px-6 border-none scroll-mt-24"
                  >
                    <AccordionTrigger className="text-left font-serif text-lg hover:no-underline hover:text-primary py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5 whitespace-pre-line">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="font-display text-2xl text-foreground mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              We're happy to help! Reach out to us directly and we'll get back to you as soon as possible.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-primary hover:underline font-medium"
            >
              {CONTACT.email}
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;