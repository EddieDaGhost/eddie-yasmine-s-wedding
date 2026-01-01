import { LockedPage } from '@/components/shared/LockedPage';
import { isAfterWeddingDate } from '@/lib/wedding-utils';
import { Layout } from '@/components/layout/Layout';
import { FadeIn } from '@/components/animation';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Heart, Sparkles } from 'lucide-react';

const SecretPage = () => {
  if (!isAfterWeddingDate()) {
    return (
      <LockedPage
        title="Secret Page"
        description="This special content is hidden until our wedding day"
      />
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <FadeIn>
          <SectionHeader
            title="You Found It!"
            subtitle="A secret message just for you"
          />
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            
            <p className="font-serif text-xl text-muted-foreground mb-8">
              Thank you for being part of our special day. 
              This page is for those who found the hidden QR code!
            </p>

            <div className="flex items-center justify-center gap-2 text-primary">
              <Heart className="w-4 h-4" />
              <span className="font-display">Eddie & Yasmine</span>
              <Heart className="w-4 h-4" />
            </div>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
};

export default SecretPage;
