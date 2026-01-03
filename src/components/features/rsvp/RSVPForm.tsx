import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FadeIn } from '@/components/animation';

interface RSVPFormData {
  name: string;
  email: string;
  attending: boolean | null;
  plusOnes: number;
  dietaryNeeds: string;
}

interface RSVPFormProps {
  onSubmit?: (data: RSVPFormData) => Promise<void>;
  isLoading?: boolean;
}

export const RSVPForm = ({ onSubmit, isLoading = false }: RSVPFormProps) => {
  const [formData, setFormData] = useState<RSVPFormData>({
    name: '',
    email: '',
    attending: null,
    plusOnes: 0,
    dietaryNeeds: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            required
          />
        </div>

        {/* Attendance */}
        <div className="space-y-3">
          <Label>Will you be attending?</Label>
          <RadioGroup
            value={formData.attending === null ? '' : formData.attending ? 'yes' : 'no'}
            onValueChange={(value) => setFormData({ ...formData, attending: value === 'yes' })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="attending-yes" />
              <Label htmlFor="attending-yes" className="font-normal cursor-pointer">
                Joyfully Accept
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="attending-no" />
              <Label htmlFor="attending-no" className="font-normal cursor-pointer">
                Regretfully Decline
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Plus Ones - only show if attending */}
        {formData.attending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <Label htmlFor="plusOnes">Number of Additional Guests</Label>
            <Input
              id="plusOnes"
              type="number"
              min="0"
              max="5"
              value={formData.plusOnes}
              onChange={(e) => setFormData({ ...formData, plusOnes: parseInt(e.target.value) || 0 })}
            />
          </motion.div>
        )}

        {/* Dietary Needs */}
        {formData.attending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <Label htmlFor="dietary">Dietary Requirements</Label>
            <Textarea
              id="dietary"
              value={formData.dietaryNeeds}
              onChange={(e) => setFormData({ ...formData, dietaryNeeds: e.target.value })}
              placeholder="Any allergies or dietary restrictions..."
              rows={3}
            />
          </motion.div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="romantic"
          size="lg"
          className="w-full"
          disabled={isLoading || formData.attending === null}
        >
          {isLoading ? 'Sending...' : 'Send RSVP'}
        </Button>
      </form>
    </FadeIn>
  );
};