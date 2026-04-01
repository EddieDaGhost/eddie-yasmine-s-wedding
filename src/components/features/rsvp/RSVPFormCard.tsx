import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Music, MessageSquare, Users, Utensils, Mail, User, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RSVPFormField } from './RSVPFormField';
import { RSVPInput } from './RSVPInput';
import { RSVPSelect } from './RSVPSelect';
import { RSVPTextarea } from './RSVPTextarea';
import { RSVPLoadingSpinner } from './RSVPLoadingSpinner';
import { rsvpFormSchema, RSVPFormData, mealOptions as defaultMealOptions, guestOptions } from './types';
import { cn } from '@/lib/utils';
import { useAllContent } from '@/hooks/useContent';

interface RSVPFormCardProps {
  onSubmit: (data: RSVPFormData, attending?: boolean) => Promise<void>;
  onSuccess: (name: string) => void;
}

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  numberOfGuests: '',
  mealChoice: '',
  attending: true,
  songRequest: '',
  notes: '',
};

export const RSVPFormCard = ({ onSubmit, onSuccess }: RSVPFormCardProps) => {
  const { data: contentData } = useAllContent();

  // Resolve meal options from content editor. Support JSON array or newline-separated list.
  const mealOptionsFromContent = (() => {
    try {
      const raw = contentData?.find((c) => c.key === 'rsvp_meal_options')?.value;
      if (!raw) return defaultMealOptions;

      // Try parse JSON
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // If array of strings
        if (parsed.every((p) => typeof p === 'string')) {
          return [{ value: '', label: 'Select your meal preference' }, ...parsed.map((s) => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s }))];
        }
        // If array of objects with value/label
        if (parsed.every((p) => p && (p.value || p.label))) {
          return [{ value: '', label: 'Select your meal preference' }, ...parsed.map((p) => ({ value: p.value || p.label, label: p.label || p.value }))];
        }
      }

      // Fallback: treat raw as newline-separated list
      const lines = raw.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        return [{ value: '', label: 'Select your meal preference' }, ...lines.map((s: string) => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s }))];
      }
    } catch (e) {
      // ignore parse errors
    }
    return defaultMealOptions;
  })();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof RSVPFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof RSVPFormData, boolean>>>({});

  const isAttending = formData.attending;

  const updateField = useCallback((field: keyof RSVPFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof RSVPFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToValidate = {
      ...formData,
      attending: true,
    };

    // Validate all fields
    const result = rsvpFormSchema.safeParse(dataToValidate);

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
        phone: true,
        numberOfGuests: true,
        mealChoice: true,
        songRequest: true,
        notes: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(result.data, true);
      onSuccess(result.data.fullName || 'Guest');
    } catch (error) {
      console.error('RSVP submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    const declineData = {
      ...formData,
      attending: false,
    };

    // Validate with attending=false (relaxed validation)
    const result = rsvpFormSchema.safeParse(declineData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RSVPFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof RSVPFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      setTouched({ email: true, phone: true });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(result.data, false);
      onSuccess(result.data.fullName || 'Guest');
    } catch (error) {
      console.error('RSVP decline failed:', error);
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
        {/* Attending Toggle */}
        <RSVPFormField label="Will you be attending?" required>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant={isAttending ? 'default' : 'outline'}
              className={cn(
                "h-12 text-sm font-medium transition-all w-full",
                isAttending && "bg-primary text-primary-foreground shadow-md"
              )}
              onClick={() => updateField('attending', true)}
              disabled={isLoading}
            >
              <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              Yes, I'll be there!
            </Button>
            <Button
              type="button"
              variant={!isAttending ? 'default' : 'outline'}
              className={cn(
                "h-12 text-sm font-medium transition-all w-full",
                !isAttending && "bg-muted-foreground/80 text-white shadow-md"
              )}
              onClick={() => updateField('attending', false)}
              disabled={isLoading}
            >
              Sorry, can't make it
            </Button>
          </div>
        </RSVPFormField>

        {/* Name Field - only required when attending */}
        {isAttending && (
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
        )}

        {/* Email Field */}
        <RSVPFormField
          label="Email Address"
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

        {/* Phone Field */}
        <RSVPFormField
          label="Phone Number"
          error={touched.phone ? errors.phone : undefined}
        >
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <RSVPInput
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              hasError={touched.phone && !!errors.phone}
              className="pl-12"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Helper text for email/phone */}
        <p className="text-xs text-muted-foreground/70 -mt-4 px-1">
          Please provide either an email address or a phone number so we can confirm your RSVP.
        </p>

        {/* Fields only shown when attending */}
        {isAttending && (
          <>
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
              error={touched.mealChoice ? errors.mealChoice : undefined}
            >
              <div className="relative">
                <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <RSVPSelect
                  value={formData.mealChoice}
                  onChange={(e) => updateField('mealChoice', e.target.value)}
                  onBlur={() => handleBlur('mealChoice')}
                  options={mealOptionsFromContent}
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
                <RSVPInput
                  type="text"
                  placeholder="Artist - Song Title"
                  value={formData.songRequest}
                  onChange={(e) => updateField('songRequest', e.target.value)}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
            </RSVPFormField>
          </>
        )}

        {/* Notes - Always visible */}
        <RSVPFormField
          label={isAttending ? "Additional Notes" : "Message for the Couple"}
          hint={isAttending ? "Dietary restrictions, accessibility needs, or anything else" : undefined}
        >
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
            <RSVPTextarea
              placeholder={isAttending ? "Let us know if you have any special requests..." : "Share your well wishes..."}
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="pl-12"
              disabled={isLoading}
            />
          </div>
        </RSVPFormField>

        {/* Submit Buttons */}
        <div className="pt-6">
          <div className="flex flex-col gap-3">
            {isAttending ? (
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
            ) : (
              <Button
                type="button"
                variant="romantic"
                size="xl"
                className="w-full h-14 text-base"
                onClick={handleDecline}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RSVPLoadingSpinner />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Response
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
};
