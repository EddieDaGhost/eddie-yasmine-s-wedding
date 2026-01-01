import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Music, MessageSquare, Users, Utensils, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RSVPFormField } from './RSVPFormField';
import { RSVPInput } from './RSVPInput';
import { RSVPSelect } from './RSVPSelect';
import { RSVPTextarea } from './RSVPTextarea';
import { RSVPLoadingSpinner } from './RSVPLoadingSpinner';
import { rsvpFormSchema, RSVPFormData, mealOptions, guestOptions } from './types';
import { cn } from '@/lib/utils';

interface RSVPFormCardProps {
  onSubmit: (data: RSVPFormData) => Promise<void>;
  onSuccess: (name: string) => void;
}

const initialFormData = {
  fullName: '',
  email: '',
  numberOfGuests: '',
  mealChoice: '',
  songRequest: '',
  notes: '',
};

export const RSVPFormCard = ({ onSubmit, onSuccess }: RSVPFormCardProps) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof RSVPFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof RSVPFormData, boolean>>>({});

  const updateField = useCallback((field: keyof RSVPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof RSVPFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field on blur
    const result = rsvpFormSchema.shape[field].safeParse(formData[field]);
    if (!result.success) {
      setErrors(prev => ({
        ...prev,
        [field]: result.error.errors[0]?.message,
      }));
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const result = rsvpFormSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RSVPFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof RSVPFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      // Mark all fields as touched
      setTouched({
        fullName: true,
        email: true,
        numberOfGuests: true,
        mealChoice: true,
        songRequest: true,
        notes: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(result.data);
      onSuccess(result.data.fullName);
    } catch (error) {
      // Handle error - could show a toast here
      console.error('RSVP submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-3xl p-6 md:p-10 shadow-elegant"
    >
      {/* Form Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
          Join Our Celebration
        </h2>
        <p className="text-muted-foreground">
          We would be honored to have you there
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <RSVPFormField
          label="Full Name"
          required
          error={touched.fullName ? errors.fullName : undefined}
        >
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <RSVPInput
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              hasError={touched.fullName && !!errors.fullName}
              className="pl-12"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Email Field */}
        <RSVPFormField
          label="Email Address"
          required
          error={touched.email ? errors.email : undefined}
        >
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <RSVPInput
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              hasError={touched.email && !!errors.email}
              className="pl-12"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Number of Guests */}
        <RSVPFormField
          label="Number of Guests"
          required
          error={touched.numberOfGuests ? errors.numberOfGuests : undefined}
          hint="Including yourself"
        >
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <RSVPSelect
              value={formData.numberOfGuests}
              onChange={(e) => updateField('numberOfGuests', e.target.value)}
              onBlur={() => handleBlur('numberOfGuests')}
              options={guestOptions}
              hasError={touched.numberOfGuests && !!errors.numberOfGuests}
              className="pl-12"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Meal Choice */}
        <RSVPFormField
          label="Meal Preference"
          required
          error={touched.mealChoice ? errors.mealChoice : undefined}
        >
          <div className="relative">
            <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <RSVPSelect
              value={formData.mealChoice}
              onChange={(e) => updateField('mealChoice', e.target.value)}
              onBlur={() => handleBlur('mealChoice')}
              options={mealOptions}
              hasError={touched.mealChoice && !!errors.mealChoice}
              className="pl-12"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Song Request - Optional */}
        <RSVPFormField
          label="Song Request"
          hint="What song will get you on the dance floor?"
        >
          <div className="relative">
            <Music className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
            <RSVPTextarea
              placeholder="Artist - Song Title"
              value={formData.songRequest}
              onChange={(e) => updateField('songRequest', e.target.value)}
              className="pl-12 min-h-[80px]"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Notes - Optional */}
        <RSVPFormField
          label="Additional Notes"
          hint="Dietary restrictions, accessibility needs, or anything else"
        >
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
            <RSVPTextarea
              placeholder="Let us know if you have any special requests..."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="pl-12"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            variant="romantic"
            size="xl"
            className="w-full h-16 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <RSVPLoadingSpinner />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Confirm Your Attendance
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
