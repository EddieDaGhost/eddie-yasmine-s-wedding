import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle2, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    plusOnes: '0',
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
        <div className="min-h-[80vh] flex items-center justify-center romantic-gradient">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center px-4 py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/20 mb-8"
            >
              <CheckCircle2 className="w-10 h-10 text-sage" />
            </motion.div>
            <h1 className="font-display text-4xl text-foreground mb-4">
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
                  plusOnes: '0',
                  dietaryNeeds: '',
                  songRequest: '',
                });
              }}
            >
              Submit Another RSVP
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="RSVP"
            subtitle="Please let us know if you'll be joining us for our special day."
          />
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Attending */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium">
                  Will you be attending? *
                </Label>
                <RadioGroup
                  value={formData.attending}
                  onValueChange={(value) => setFormData({ ...formData, attending: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="text-muted-foreground cursor-pointer">
                      Joyfully Accepts
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="text-muted-foreground cursor-pointer">
                      Regretfully Declines
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.attending === 'yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-8"
                >
                  {/* Plus Ones */}
                  <div className="space-y-2">
                    <Label htmlFor="plusOnes" className="text-foreground font-medium">
                      Number of Guests (including yourself)
                    </Label>
                    <select
                      id="plusOnes"
                      value={formData.plusOnes}
                      onChange={(e) => setFormData({ ...formData, plusOnes: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>

                  {/* Dietary Needs */}
                  <div className="space-y-2">
                    <Label htmlFor="dietary" className="text-foreground font-medium">
                      Dietary Restrictions
                    </Label>
                    <Input
                      id="dietary"
                      type="text"
                      placeholder="Vegetarian, vegan, gluten-free, allergies, etc."
                      value={formData.dietaryNeeds}
                      onChange={(e) => setFormData({ ...formData, dietaryNeeds: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  {/* Song Request */}
                  <div className="space-y-2">
                    <Label htmlFor="song" className="text-foreground font-medium">
                      Song Request
                    </Label>
                    <Textarea
                      id="song"
                      placeholder="What song will get you on the dance floor?"
                      value={formData.songRequest}
                      onChange={(e) => setFormData({ ...formData, songRequest: e.target.value })}
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
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
            </form>

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
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default RSVP;
