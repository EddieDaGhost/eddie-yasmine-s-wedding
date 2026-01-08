import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { motion } from 'framer-motion';

const InteractiveTimeline = () => {
  const { isUnlocked, isAdminPreview } = useIsUnlocked();

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Interactive Timeline"
        description="Relive our love story with photos and videos - available on the wedding day!"
      />
    );
  }

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Interactive Timeline" />}
      
      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Our Journey Together"
            subtitle="A visual timeline of our love story with photos and memories."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground"
          >
            <p>Interactive timeline content will be displayed here after the wedding.</p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default InteractiveTimeline;
