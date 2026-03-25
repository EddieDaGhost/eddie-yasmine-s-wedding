import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAllContent } from "@/hooks/useContent";

const FAQ = () => {
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

  // Pull CMS content
  const faqTitle = data?.find((c) => c.key === "faq_title")?.value || "Frequently Asked Questions";
  const faqSubtitle =
    data?.find((c) => c.key === "faq_subtitle")?.value ||
    "Everything you need to know about our wedding day.";

  // Default FAQ items used when no CMS content is set
  const defaultFaqItems: { question: string; answer: string }[] = [
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
      answer:
        "Please RSVP by May 15th, 2027 so we can finalize our guest count, seating arrangements, and catering. You can RSVP directly through our website.",
    },
    {
      question: "Where is the wedding being held?",
      answer:
        "Our ceremony and reception will both take place at Blue Dress Barn, located at 5815 W Napier Ave, Benton Harbor, Michigan 49022. Please visit our Travel page for directions and nearby hotel recommendations.",
    },
    {
      question: "What is the dress code?",
      answer:
        "We kindly ask guests to wear semi-formal attire. Think cocktail dresses, suits, or dressy separates. Please keep in mind that parts of the venue have outdoor and grassy areas, so plan your footwear accordingly.",
    },
    {
      question: "What time should I arrive?",
      answer:
        "We recommend arriving at least 30 minutes before the ceremony start time to get settled. Please check our Event Details page for the full schedule.",
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
      answer:
        "Yes! A full dinner and drinks will be provided. If you have dietary restrictions or allergies, please let us know when you RSVP so we can accommodate you.",
    },
    {
      question: "What if I need to update my RSVP?",
      answer:
        "If your plans change, please reach out to us as soon as possible at wedding@eddieyasmine.com so we can update our records.",
    },
  ];

  // FAQ items stored as JSON in the content table
  const faqJson = data?.find((c) => c.key === "faq_items")?.value;
  let faqItems: { question: string; answer: string }[] = [];

  try {
    faqItems = faqJson ? JSON.parse(faqJson) : [];
  } catch {
    faqItems = [];
  }

  // Use defaults if no CMS content is set
  if (faqItems.length === 0) {
    faqItems = defaultFaqItems;
  }

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
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="glass-card rounded-xl px-6 border-none"
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
              href="mailto:wedding@eddieyasmine.com"
              className="text-primary hover:underline font-medium"
            >
              wedding@eddieyasmine.com
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;