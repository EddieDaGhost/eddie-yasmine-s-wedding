import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FadeIn } from '@/components/animation';
import { RSVPFormCard, RSVPSuccessView, RSVPFormData } from '@/components/features/rsvp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const RSVP = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  /**
   * Submit RSVP to Supabase
   */
  const handleSubmit = useCallback(async (data: RSVPFormData): Promise<void> => {
    try {
      // Insert RSVP into Supabase
      const { error } = await supabase.from('rsvps').insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        number_of_guests: parseInt(data.numberOfGuests),
        attending: data.attending,
        dietary_restrictions: data.dietaryRestrictions || null,
        song_request: data.songRequest || null,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('RSVP successfully saved to Supabase!', data);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error saving your RSVP. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw so the form knows it failed
    }
  }, [toast]);

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
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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