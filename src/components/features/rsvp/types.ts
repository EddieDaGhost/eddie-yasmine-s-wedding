import { z } from 'zod';

export const rsvpFormSchema = z.object({
  fullName: z.string().max(100, 'Name is too long').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
  numberOfGuests: z.string().optional().or(z.literal('')),
  mealChoice: z.string().optional().or(z.literal('')),
  attending: z.boolean().optional(),
  songRequest: z.string().max(200, 'Song request is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
}).superRefine((data, ctx) => {
  // If attending (or no explicit choice yet), require name + (email or phone)
  if (data.attending !== false) {
    if (!data.fullName || data.fullName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter your full name',
        path: ['fullName'],
      });
    }
    if (!data.numberOfGuests) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select number of guests',
        path: ['numberOfGuests'],
      });
    }
  }
  // Always require at least email or phone
  const hasEmail = data.email && data.email.length > 0;
  const hasPhone = data.phone && data.phone.length > 0;
  if (!hasEmail && !hasPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide an email address or phone number',
      path: ['email'],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide an email address or phone number',
      path: ['phone'],
    });
  }
});

export type RSVPFormData = z.infer<typeof rsvpFormSchema>;

export interface RSVPFormState {
  isLoading: boolean;
  isSubmitted: boolean;
  errors: Partial<Record<keyof RSVPFormData, string>>;
}

export const mealOptions = [
  { value: '', label: 'Select your meal preference' },
  { value: 'beef', label: 'Beef Tenderloin' },
  { value: 'chicken', label: 'Herb-Roasted Chicken' },
  { value: 'fish', label: 'Pan-Seared Salmon' },
  { value: 'vegetarian', label: 'Vegetarian Risotto' },
  { value: 'vegan', label: 'Vegan Garden Plate' },
] as const;

export const guestOptions = [
  { value: '', label: 'Select number of guests' },
  { value: '1', label: '1 Guest (Just me)' },
  { value: '2', label: '2 Guests' },
  { value: '3', label: '3 Guests' },
  { value: '4', label: '4 Guests' },
  { value: '5', label: '5 Guests' },
] as const;
