import { motion } from 'framer-motion';
import { Gift, ExternalLink, Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { useAllContent } from "@/hooks/useContent";

const Registry = () => {
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

  // Hero
  const title = data?.find((c) => c.key === "registry_title")?.value || "Gift Registry";
  const subtitle =
    data?.find((c) => c.key === "registry_subtitle")?.value ||
    "Your presence is the greatest gift, but if you'd like to give something more, here are some ideas.";

  // Message
  const message =
    data?.find((c) => c.key === "registry_message")?.value ||
    "Having you celebrate with us is truly the best gift we could receive. However, if you wish to honor us with a gift, we have registered at a few of our favorite stores. We are also contributing to our honeymoon fund if you prefer to give towards our travel adventures.";

  // Registry Items
  const registriesJson = data?.find((c) => c.key === "registry_items")?.value;
  let registries: { name: string; description: string; link: string }[] = [];
  try {
    registries = registriesJson ? JSON.parse(registriesJson) : [];
  } catch {}

  // Thank You
  const thankYouTitle =
    data?.find((c) => c.key === "registry_thankyou_title")?.value || "Thank You";
  const thankYouMessage =
    data?.find((c) => c.key === "registry_thankyou_message")?.value ||
    "We are so grateful for your love and support as we begin this new chapter together.";

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader title={title} subtitle={subtitle} />
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
            <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
              {message}
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
              {thankYouTitle}
            </p>
            <p className="text-muted-foreground whitespace-pre-line">
              {thankYouMessage}
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Registry;