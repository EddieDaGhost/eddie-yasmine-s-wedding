import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';

const bridesmaids = [
  { name: 'Sarah Chen', role: 'Maid of Honor', description: 'Yasmine\'s best friend since childhood' },
  { name: 'Emma Rodriguez', role: 'Bridesmaid', description: 'College roommate and forever friend' },
  { name: 'Lily Thompson', role: 'Bridesmaid', description: 'Cousin and adventure buddy' },
  { name: 'Maya Patel', role: 'Bridesmaid', description: 'Coworker turned sister' },
];

const groomsmen = [
  { name: 'Marcus Johnson', role: 'Best Man', description: 'Eddie\'s brother and lifelong confidant' },
  { name: 'David Kim', role: 'Groomsman', description: 'High school best friend' },
  { name: 'James Wilson', role: 'Groomsman', description: 'Basketball teammate and brother' },
  { name: 'Alex Rivera', role: 'Groomsman', description: 'College roommate and business partner' },
];

interface PartyMemberCardProps {
  name: string;
  role: string;
  description: string;
  index: number;
}

const PartyMemberCard = ({ name, role, description, index }: PartyMemberCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group"
  >
    <div className="glass-card rounded-2xl p-6 text-center hover:shadow-elegant transition-all duration-300">
      {/* Avatar Placeholder */}
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform">
        <span className="font-display text-3xl text-primary">
          {name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      
      {/* Role Badge */}
      <span className="inline-block px-3 py-1 bg-blush text-blush-foreground text-xs font-medium rounded-full mb-3">
        {role}
      </span>
      
      {/* Name */}
      <h3 className="font-serif text-xl text-foreground mb-2">
        {name}
      </h3>
      
      {/* Description */}
      <p className="text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  </motion.div>
);

const WeddingParty = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="The Wedding Party"
            subtitle="The wonderful people standing by our side on our special day."
          />
        </div>
      </section>

      {/* Bridesmaids Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-center text-foreground mb-12"
          >
            The Bride's Side
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {bridesmaids.map((member, index) => (
              <PartyMemberCard key={member.name} {...member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="flex items-center justify-center py-8">
        <div className="decorative-line w-48" />
      </div>

      {/* Groomsmen Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-center text-foreground mb-12"
          >
            The Groom's Side
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {groomsmen.map((member, index) => (
              <PartyMemberCard key={member.name} {...member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="font-display text-2xl text-foreground mb-4">
              Thank You
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To our amazing wedding party: thank you for your love, support, and for standing 
              by us as we begin this new chapter. We couldn't imagine our day without each of you.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default WeddingParty;
