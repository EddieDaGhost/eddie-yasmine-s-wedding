import { isAfterWeddingDate } from '@/lib/wedding-utils';
import { LockedPage } from '@/components/shared/LockedPage';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { motion } from 'framer-motion';

const mockPhotos = [
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
];

const Gallery = () => {
  if (!isAfterWeddingDate()) {
    return (
      <LockedPage
        title="Photo Gallery"
        description="View all the beautiful photos from the celebration - available after the wedding!"
      />
    );
  }

  return (
    <Layout>
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Wedding Gallery"
            subtitle="Beautiful moments captured from our special day."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={photo}
                  alt={`Wedding photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
