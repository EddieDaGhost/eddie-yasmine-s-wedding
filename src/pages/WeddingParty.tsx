import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { WeddingCard, WeddingCardHeader, WeddingCardTitle, WeddingCardDescription } from '@/components/shared/WeddingCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animation';
import { useAllContent } from "@/hooks/useContent";

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

  // Hero
  const title = data?.find((c) => c.key === "weddingparty_title")?.value || "The Wedding Party";
  const subtitle =
    data?.find((c) => c.key === "weddingparty_subtitle")?.value ||
    "The wonderful people standing by our side on our special day.";

  // Bridesmaids
  const bridesmaidsJson = data?.find((c) => c.key === "weddingparty_bridesmaids")?.value;
  let bridesmaids: PartyMemberCardProps[] = [];
  try {
    bridesmaids = bridesmaidsJson ? JSON.parse(bridesmaidsJson) : [];
  } catch {}

  // Groomsmen
  const groomsmenJson = data?.find((c) => c.key === "weddingparty_groomsmen")?.value;
  let groomsmen: PartyMemberCardProps[] = [];
  try {
    groomsmen = groomsmenJson ? JSON.parse(groomsmenJson) : [];
  } catch {}

  // Thank You
  const thankYouTitle =
    data?.find((c) => c.key === "weddingparty_thankyou_title")?.value || "Thank You";
  const thankYouMessage =
    data?.find((c) => c.key === "weddingparty_thankyou_message")?.value ||
    "To our amazing wedding party: thank you for your love, support, and for standing by us as we begin this new chapter.";

  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" spacing="lg">
        <SectionHeader title={title} subtitle={subtitle} />
      </Section>

      {/* Bridesmaids Section */}
      <Section spacing="md">
        <FadeIn>
          <h3 className="font-display text-2xl md:text-3xl text-center text-foreground mb-12">
            The Bride's Side
          </h3>
        </FadeIn>

        <Container size="lg">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 justify-center">
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
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 justify-center">
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
                {thankYouTitle}
              </p>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {thankYouMessage}
              </p>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </Layout>
  );
};

export default WeddingParty;