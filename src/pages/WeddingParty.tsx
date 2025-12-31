import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { WeddingCard, WeddingCardHeader, WeddingCardTitle, WeddingCardDescription } from '@/components/shared/WeddingCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animation';

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
}

const PartyMemberCard = ({ name, role, description }: PartyMemberCardProps) => (
  <WeddingCard variant="glass" hoverable className="text-center h-full group">
    {/* Avatar Placeholder */}
    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
      <span className="font-display text-2xl md:text-3xl text-primary">
        {name.split(' ').map(n => n[0]).join('')}
      </span>
    </div>
    
    {/* Role Badge */}
    <span className="inline-block px-3 py-1 bg-blush text-blush-foreground text-xs font-medium rounded-full mb-3">
      {role}
    </span>
    
    <WeddingCardHeader>
      <WeddingCardTitle className="text-lg md:text-xl">
        {name}
      </WeddingCardTitle>
      <WeddingCardDescription>
        {description}
      </WeddingCardDescription>
    </WeddingCardHeader>
  </WeddingCard>
);

const WeddingParty = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" spacing="lg">
        <SectionHeader
          title="The Wedding Party"
          subtitle="The wonderful people standing by our side on our special day."
        />
      </Section>

      {/* Bridesmaids Section */}
      <Section spacing="md">
        <FadeIn>
          <h3 className="font-display text-2xl md:text-3xl text-center text-foreground mb-12">
            The Bride's Side
          </h3>
        </FadeIn>
        
        <Container size="lg">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bridesmaids.map((member) => (
              <StaggerItem key={member.name}>
                <PartyMemberCard {...member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      {/* Decorative Divider */}
      <div className="flex items-center justify-center py-8">
        <div className="decorative-line w-48" />
      </div>

      {/* Groomsmen Section */}
      <Section spacing="md">
        <FadeIn>
          <h3 className="font-display text-2xl md:text-3xl text-center text-foreground mb-12">
            The Groom's Side
          </h3>
        </FadeIn>
        
        <Container size="lg">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {groomsmen.map((member) => (
              <StaggerItem key={member.name}>
                <PartyMemberCard {...member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      {/* Thank You Section */}
      <Section variant="muted" spacing="md">
        <Container size="sm">
          <FadeIn>
            <div className="text-center">
              <p className="font-display text-2xl text-foreground mb-4">
                Thank You
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To our amazing wedding party: thank you for your love, support, and for standing 
                by us as we begin this new chapter.
              </p>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </Layout>
  );
};

export default WeddingParty;
