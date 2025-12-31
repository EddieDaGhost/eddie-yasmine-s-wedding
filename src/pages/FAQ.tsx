import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'What is the dress code?',
    answer: 'The dress code is formal / black tie optional. Ladies may wear long gowns, cocktail dresses, or elegant jumpsuits. Gentlemen may wear tuxedos, dark suits, or formal attire. Please avoid white, ivory, or cream as these are reserved for the bride.',
  },
  {
    question: 'Can I bring a plus one?',
    answer: 'Due to venue capacity, we can only accommodate guests named on the invitation. If you received a plus one, their name will be included on your invitation. If you have any questions, please reach out to us directly.',
  },
  {
    question: 'Are children welcome?',
    answer: 'While we love your little ones, our wedding will be an adults-only celebration. We hope this gives you the chance to enjoy a kid-free evening!',
  },
  {
    question: 'What time should I arrive?',
    answer: 'Guests should arrive by 3:00 PM for welcome drinks. The ceremony will begin promptly at 4:00 PM. Please plan to arrive with enough time to find parking and be seated.',
  },
  {
    question: 'Is the venue accessible?',
    answer: 'Yes, The Grand Estate is fully wheelchair accessible. Please let us know in your RSVP if you have any specific accessibility needs and we will do our best to accommodate.',
  },
  {
    question: 'Will there be vegetarian/vegan options?',
    answer: 'Absolutely! Please indicate your dietary restrictions in your RSVP and we will ensure there are delicious options for you. Our caterer can accommodate most dietary needs including gluten-free, vegetarian, vegan, and common allergies.',
  },
  {
    question: 'Can I take photos during the ceremony?',
    answer: 'We kindly ask that our ceremony be unplugged. Please put away phones and cameras during the ceremony so you can be fully present with us. Our photographer will capture all the special moments! You are welcome to take photos during the reception.',
  },
  {
    question: 'What happens if it rains?',
    answer: 'The Grand Estate has a beautiful indoor space as a backup, so the celebration will go on rain or shine! The ceremony and reception can both be held indoors if needed.',
  },
  {
    question: 'Is there parking at the venue?',
    answer: 'Yes, complimentary valet parking will be available for all guests. Simply pull up to the main entrance and our valet team will take care of your vehicle.',
  },
  {
    question: 'How do I get to the venue?',
    answer: 'The Grand Estate is located at 1234 Vineyard Lane, Napa Valley, CA 94558. We recommend using GPS navigation. More detailed directions are available on our Travel page.',
  },
];

const FAQ = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about our wedding day."
          />
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
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
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
