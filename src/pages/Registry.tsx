import { motion } from 'framer-motion';
import { Gift, ExternalLink, Heart, Plane, Home as HomeIcon, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { useAllContent } from "@/hooks/useContent";

const fundIcons = [Plane, HomeIcon, Sparkles];

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
  const title = data?.find((c) => c.key === "registry_title")?.value || "Gifts";
  const subtitle =
    data?.find((c) => c.key === "registry_subtitle")?.value ||
    "Your presence is the greatest gift of all.";

  // Message
  const message =
    data?.find((c) => c.key === "registry_message")?.value ||
    "We have been fortunate to build a home together already, and there is little we truly need. More than anything, we want you with us on the day.\n\nShould you wish to honor us with something more, we would be most grateful for a contribution toward the life we are building — our honeymoon, our home, and whatever comes next. However you choose to celebrate with us, please know that it means the world.";

  // Funds — monetary gift categories, overridable from the content editor
  const fundsJson = data?.find((c) => c.key === "registry_funds")?.value;
  let funds: { name: string; description: string }[] = [];
  try {
    funds = fundsJson ? JSON.parse(fundsJson) : [];
  } catch {}
  if (funds.length === 0) {
    funds = [
      {
        name: "Our Honeymoon",
        description:
          "Toward the first journey we'll take as husband and wife — long mornings, new places, and time to simply be together.",
      },
      {
        name: "Our Home",
        description:
          "Toward the small and lasting things that turn a house into a home, made a little warmer knowing you helped.",
      },
      {
        name: "Our Future",
        description:
          "Toward the chapters still unwritten. A gift here becomes part of whatever we build in the years ahead.",
      },
    ];
  }

  // How to give
  const howTitle =
    data?.find((c) => c.key === "registry_how_title")?.value || "How to Give";
  const howMessage =
    data?.find((c) => c.key === "registry_how_message")?.value ||
    "Cards may be brought with you on the wedding day, where a place will be set aside for them. If you would prefer to send something ahead of time, please reach out to us directly and we would be glad to help.";

  // Optional traditional registries — only shown if configured
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

      {/* Gift Funds */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {funds.map((fund, index) => {
              const Icon = fundIcons[index % fundIcons.length];
              return (
                <motion.div
                  key={fund.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8 text-center hover:shadow-elegant transition-all duration-300"
                >
                  <Icon className="w-8 h-8 text-primary mx-auto mb-5" />
                  <h3 className="font-serif text-2xl text-foreground mb-3">
                    {fund.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {fund.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Give */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="font-display text-2xl text-foreground mb-4">
              {howTitle}
            </p>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {howMessage}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Optional traditional registries */}
      {registries.length > 0 && (
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
      )}

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
