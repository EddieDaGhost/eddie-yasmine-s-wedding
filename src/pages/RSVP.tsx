import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FadeIn } from '@/components/animation';
import { RSVPFormCard, RSVPSuccessView, RSVPFormData } from '@/components/features/rsvp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RSVP = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  /**
   * Placeholder submit handler - replace with Supabase logic
   */
  const handleSubmit = useCallback(async (formData: RSVPFormData): Promise<void> => {
    // Map form values to DB columns
    const payload = {
      name: formData.fullName,
      email: formData.email,
      guests: parseInt(formData.numberOfGuests, 10) || 1,
      meal_choice: formData.mealChoice || null,
      message: formData.notes || null,
      status: 'attending',
    } as const;

    // Insert RSVP row
    const { data: insertData, error: insertError } = await supabase
      .from('rsvps')
      .insert([payload])
      .select('id')
      .limit(1);

    if (insertError) {
      console.error('Failed to insert RSVP:', insertError);
      throw insertError;
    }

    const insertedId = Array.isArray(insertData) && insertData[0]?.id ? insertData[0].id : null;

    // If user provided a song request, attempt to save to `song_requests` table
    if (formData.songRequest?.trim()) {
      // Expecting format "Artist - Song Title" but tolerate freeform input
      const parts = formData.songRequest.split('-').map((s) => s.trim()).filter(Boolean);
      let title = formData.songRequest;
      let artist = null;
      if (parts.length >= 2) {
        artist = parts[0];
        title = parts.slice(1).join(' - ');
      }

      try {
        await supabase.from('song_requests').insert([{ title, artist, guest_id: insertedId }]);
      } catch (err) {
        // Non-fatal: log and continue
        console.warn('Failed to save song request:', err);
      }
    }
  }, []);

  const handleSuccess = useCallback((name: string) => {
    setSubmittedName(name);
    setIsSubmitted(true);
    toast({
      title: "RSVP Received!",
      description: "Thank you for your response. We can't wait to celebrate with you!",
    });
  }, [toast]);

  const handleSubmitAnother = useCallback(() => {
    setIsSubmitted(false);
    setSubmittedName('');
  }, []);

  // Success State
  if (isSubmitted) {
    return (
      <Layout>
        <Section variant="gradient" spacing="hero" className="min-h-[80vh] flex items-center">
          <Container size="md">
            <RSVPSuccessView
              guestName={submittedName}
              onSubmitAnother={handleSubmitAnother}
            />
          </Container>
        </Section>
      </Layout>
    );
  }

  // Form State
  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" spacing="lg" className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1 }}
            className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl"
          />
        </div>

        <SectionHeader
          title="RSVP"
          subtitle="Please let us know if you'll be joining us on our special day. We would be honored to have you celebrate with us."
        />
      </Section>

      {/* Form Section */}
      <Section spacing="md" className="relative -mt-8 md:-mt-16">
        <Container size="sm">
          <FadeIn>
            <RSVPFormCard
              onSubmit={handleSubmit}
              onSuccess={handleSuccess}
            />

            {/* Response Deadline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-3 mt-10 text-muted-foreground"
            >
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                Please respond by June 1st, 2027
              </span>
            </motion.div>

            {/* Decorative Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
              <Heart className="w-4 h-4 text-primary/40" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
            </motion.div>
          </FadeIn>
        </Container>
      </Section>
    </Layout>
  );
};

export default RSVP;
