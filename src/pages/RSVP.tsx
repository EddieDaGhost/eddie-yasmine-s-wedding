import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CheckCircle2, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Section, Container } from '@/components/shared/Section';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { WeddingCard } from '@/components/shared/WeddingCard';
import { FormField, StyledInput, StyledTextarea, StyledSelect } from '@/components/shared/FormComponents';
import { FadeIn } from '@/components/animation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const RSVP = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attending: 'yes',
    plusOnes: '1',
    dietaryNeeds: '',
    songRequest: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call - will be replaced with Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSubmitted(true);
    toast({
      title: "RSVP Received!",
      description: "Thank you for your response. We can't wait to celebrate with you!",
    });
  };

  if (isSubmitted) {
    return (
      <Layout>
        <Section variant="gradient" spacing="hero" className="min-h-[80vh] flex items-center">
          <Container size="sm">
            <FadeIn>
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/20 mb-8"
                >
                  <CheckCircle2 className="w-10 h-10 text-sage" />
                </motion.div>
                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                  Thank You!
                </h1>
                <p className="text-muted-foreground text-lg mb-8">
                  {formData.attending === 'yes'
                    ? "We're so excited to celebrate with you on our special day!"
                    : "We're sorry you can't make it, but we'll miss you!"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      attending: 'yes',
                      plusOnes: '1',
                      dietaryNeeds: '',
                      songRequest: '',
                    });
                  }}
                >
                  Submit Another RSVP
                </Button>
              </div>
            </FadeIn>
          </Container>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" spacing="lg">
        <SectionHeader
          title="RSVP"
          subtitle="Please let us know if you'll be joining us for our special day."
        />
      </Section>

      {/* Form Section */}
      <Section spacing="md">
        <Container size="sm">
          <FadeIn>
            <WeddingCard variant="elevated" padding="lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <FormField label="Full Name" required>
                  <StyledInput
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </FormField>

                {/* Email */}
                <FormField label="Email Address" required>
                  <StyledInput
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </FormField>

                {/* Attending */}
                <FormField label="Will you be attending?" required>
                  <RadioGroup
                    value={formData.attending}
                    onValueChange={(value) => setFormData({ ...formData, attending: value })}
                    className="flex flex-wrap gap-6 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="text-foreground cursor-pointer">
                        Joyfully Accepts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="text-foreground cursor-pointer">
                        Regretfully Declines
                      </Label>
                    </div>
                  </RadioGroup>
                </FormField>

                <AnimatePresence>
                  {formData.attending === 'yes' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 overflow-hidden"
                    >
                      {/* Plus Ones */}
                      <FormField label="Number of Guests" hint="Including yourself">
                        <StyledSelect
                          value={formData.plusOnes}
                          onChange={(e) => setFormData({ ...formData, plusOnes: e.target.value })}
                          options={[
                            { value: '1', label: '1 Guest' },
                            { value: '2', label: '2 Guests' },
                            { value: '3', label: '3 Guests' },
                            { value: '4', label: '4 Guests' },
                          ]}
                        />
                      </FormField>

                      {/* Dietary Needs */}
                      <FormField label="Dietary Restrictions">
                        <StyledInput
                          type="text"
                          placeholder="Vegetarian, vegan, gluten-free, allergies, etc."
                          value={formData.dietaryNeeds}
                          onChange={(e) => setFormData({ ...formData, dietaryNeeds: e.target.value })}
                        />
                      </FormField>

                      {/* Song Request */}
                      <FormField label="Song Request">
                        <StyledTextarea
                          placeholder="What song will get you on the dance floor?"
                          value={formData.songRequest}
                          onChange={(e) => setFormData({ ...formData, songRequest: e.target.value })}
                        />
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="romantic"
                    size="xl"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit RSVP
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </WeddingCard>

            {/* Deadline Note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-muted-foreground text-sm mt-8"
            >
              <Heart className="w-4 h-4 inline-block mr-1 text-primary" />
              Please respond by June 1st, 2027
            </motion.p>
          </FadeIn>
        </Container>
      </Section>
    </Layout>
  );
};

export default RSVP;
