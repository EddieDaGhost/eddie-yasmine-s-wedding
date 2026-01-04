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

  // FAQ items stored as JSON in the content table
  const faqJson = data?.find((c) => c.key === "faq_items")?.value;
  let faqItems: { question: string; answer: string }[] = [];

  try {
    faqItems = faqJson ? JSON.parse(faqJson) : [];
  } catch {
    faqItems = [];
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