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

  const DEFAULT_BRIDESMAIDS: PartyMemberCardProps[] = [
    {
      name: "Anais Pacheco",
      role: "Maid of Honor",
      description:
        "Bride’s second eldest sister and built-in best friend. The one person who can usually get through to the bride when no one else can. Housewives partner-in-crime, cat sitter extraordinaire, and forever one of the bride and groom’s biggest supporters.",
    },
    {
      name: "Vanessa Pacheco",
      role: "Matron of Honor",
      description:
        "Bride’s big sister and go-to for honest advice. Superwoman who somehow does everything and makes it look easy. She survived having the bride as a bratty little sister and still loves her anyway.",
    },
    {
      name: "Gloria Correa",
      role: "Bridesmaid",
      description:
        "Groom’s little sister and the bride’s fellow sassy little sister. Hilarious, thoughtful, and the queen of giving gifts she absolutely needs to watch you open. A sister the bride is lucky to have gained.",
    },
    {
      name: "Maria Correa",
      role: "Bridesmaid",
      description:
        "Groom’s eldest little sister and one of the kindest people you’ll ever meet. Responsible, caring, and always looking out for everyone, while still being one of the silliest people in the room.",
    },
    {
      name: "Brittanie LaCour",
      role: "Bridesmaid",
      description:
        "Bride’s high school best friend and longtime partner in crime. Sleepovers, sports, prom, heartbreaks, and a Jason Derulo dance are just a few of their greatest hits. No one showed up to the 10 year reunion because we planned it but thankfully, we always have each other.",
    },
    {
      name: "Margi Gomez",
      role: "Bridesmaid",
      description:
        "Bride’s high school friend who was once intimidating enough to make her want to avoid all eye contact. Years later, she became one of the bride’s closest friends and someone who can make her laugh until she cries. Proof that first impressions aren’t always right.",
    },
    {
      name: "Sirena Mota",
      role: "Bridesmaid",
      description:
        "Bride’s college roommate turned lifelong friend. Their friendship began with an awkward library encounter involving her and the bride, and grew into one of the most important friendships in the bride’s life. The friend who was there when the bride needed someone most, and has never stopped showing up.",
    },
  ];

  const DEFAULT_GROOMSMEN: PartyMemberCardProps[] = [
    {
      name: "Tony Correa",
      role: "Best Man",
      description:
        "The groom’s first cousin who has always been more like a brother. He grew up with Eddie, went to the same college, and even joined the same fraternity. One of the best men and a true brother for life, despite the fact that his father raised him to be a Packers fan.",
    },
    {
      name: "Diego Gomez",
      role: "Best Man",
      description:
        "The groom’s high school soccer teammate who became another brother over the years. Now living in North Carolina, he and the groom have shared cherished moments like watching the Bears beat the Packers in overtime, and hundreds of hours of Marvel Rivals. Nature-loving, hike-ready, and always down for the next adventure. A great man and an even better brother.",
    },
    {
      name: "Alex Esparza",
      role: "Groomsman",
      description:
        "Eddie’s high school soccer and volleyball teammate and one of Eddie’s closest friends turned brother. Road trips, White Sox games, and plenty of memorable stories later, he’s still one of the crew and is now in his family era.",
    },
    {
      name: "Missael Pale",
      role: "Groomsman",
      description:
        "The groom’s high school friend and teammate turned college roommate and fraternity brother at UIUC. One of the closest friends from those years, with a strong bond built on shared trips, years of fraternity events and time together. Big into biking and nature, and always ready for the next outdoor escape.",
    },
    {
      name: "Nikolas Correa",
      role: "Groomsman",
      description:
        "The groom’s little brother with a shared father for better or worse, only time will tell. They had some catching up to do since Nikolas was young during Eddie’s college years, but he’s truly one of one. Video-game enthusiast, and someone the groom will always love, protect, and care for… even though he’s a Detroit Lions fan for no good reason other than pure spite.",
    },
    {
      name: "Darren Ward",
      role: "Groomsman",
      description:
        "The groom’s fraternity brother and college roommate who’s been there through the growth of the relationship with the bride. Was alongside the groom for some of the most insane fraternity situations and prevented many more. Moved to Colorado, loves drinking, working out, anime deep-dives, and never hesitates to call someone a dumbass. There’s no better friend and brother to grill with.",
    },
    {
      name: "Adrian Guerrero",
      role: "Groomsman",
      description:
        "The groom’s cousin who was his best friend long before either of them realized they were related. Pre-K classmates, sleepover buddies, and the one family member for late-night video game marathons. They once promised to be each other’s best men - until years of minimal communication bumped him down the list. The groom’s favorite paradox: extremely wise one minute, immature and borderline insane the next. No matter the time or distance, he’ll always be a brother.",
    },
  ];

  // Bridesmaids
  const bridesmaidsJson = data?.find((c) => c.key === "weddingparty_bridesmaids")?.value;
  let bridesmaids: PartyMemberCardProps[] = DEFAULT_BRIDESMAIDS;
  try {
    if (bridesmaidsJson) bridesmaids = JSON.parse(bridesmaidsJson);
  } catch {}

  // Groomsmen
  const groomsmenJson = data?.find((c) => c.key === "weddingparty_groomsmen")?.value;
  let groomsmen: PartyMemberCardProps[] = DEFAULT_GROOMSMEN;
  try {
    if (groomsmenJson) groomsmen = JSON.parse(groomsmenJson);
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
          <StaggerContainer className="flex flex-wrap justify-center gap-6">
            {bridesmaids.map((member) => (
              <StaggerItem key={member.name} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
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
          <StaggerContainer className="flex flex-wrap justify-center gap-6">
            {groomsmen.map((member) => (
              <StaggerItem key={member.name} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
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