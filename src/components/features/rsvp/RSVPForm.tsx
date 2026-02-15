import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FadeIn } from '@/components/animation';
import { nameSchema, emailSchema, optionalMessageSchema } from '@/lib/validation';

// RSVP Form Validation Schema
const rsvpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  attending: z.boolean({
    required_error: 'Please select whether you will attend',
  }),
  plusOnes: z.number().int().min(0).max(5, 'Maximum 5 additional guests'),
  dietaryNeeds: optionalMessageSchema,
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
  onSubmit?: (data: RSVPFormData) => Promise<void>;
  isLoading?: boolean;
}

export const RSVPForm = ({ onSubmit, isLoading = false }: RSVPFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: '',
      email: '',
      plusOnes: 0,
      dietaryNeeds: '',
    },
  });

  const attending = watch('attending');

  const onSubmitHandler = async (data: RSVPFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 max-w-lg mx-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Your full name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Attendance */}
        <div className="space-y-3">
          <Label>Will you be attending?</Label>
          <RadioGroup
            value={attending === undefined ? '' : attending ? 'yes' : 'no'}
            onValueChange={(value) => setValue('attending', value === 'yes', { shouldValidate: true })}
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
          {errors.attending && (
            <p className="text-sm text-destructive">{errors.attending.message}</p>
          )}
        </div>

        {/* Plus Ones - only show if attending */}
        {attending && (
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
              {...register('plusOnes', { valueAsNumber: true })}
              className={errors.plusOnes ? 'border-destructive' : ''}
            />
            {errors.plusOnes && (
              <p className="text-sm text-destructive">{errors.plusOnes.message}</p>
            )}
          </motion.div>
        )}

        {/* Dietary Needs */}
        {attending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <Label htmlFor="dietary">Dietary Requirements</Label>
            <Textarea
              id="dietary"
              {...register('dietaryNeeds')}
              placeholder="Any allergies or dietary restrictions..."
              rows={3}
              className={errors.dietaryNeeds ? 'border-destructive' : ''}
            />
            {errors.dietaryNeeds && (
              <p className="text-sm text-destructive">{errors.dietaryNeeds.message}</p>
            )}
          </motion.div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="romantic"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send RSVP'}
        </Button>
      </form>
    </FadeIn>
  );
};