import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, Check, AlertCircle, Loader2, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Invite {
  id: string;
  code: string;
  max_guests: number;
  used_by: string | null;
  label: string | null;
}

interface ExistingRSVP {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  meal_preference: string | null;
  song_requests: string | null;
  message: string | null;
}

export default function InviteRSVP() {
  const { code } = useParams<{ code: string }>();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [existingRsvp, setExistingRsvp] = useState<ExistingRSVP | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    attending: true,
    guests: 1,
    guestNames: [''] as string[],
    mealPreference: '',
    songRequests: '',
    message: '',
  });

  // Update guest names array when guest count changes
  const updateGuestCount = (count: number) => {
    const newGuestNames = [...formData.guestNames];
    if (count > newGuestNames.length) {
      // Add empty strings for new guests
      while (newGuestNames.length < count) {
        newGuestNames.push('');
      }
    } else {
      // Trim array to new count
      newGuestNames.length = count;
    }
    setFormData({ ...formData, guests: count, guestNames: newGuestNames });
  };

  const updateGuestName = (index: number, name: string) => {
    const newGuestNames = [...formData.guestNames];
    newGuestNames[index] = name;
    setFormData({ ...formData, guestNames: newGuestNames });
  };

  useEffect(() => {
    async function validateInvite() {
      if (!code) {
        setError('Invalid invite link');
        setLoading(false);
        return;
      }

      try {
        // Fetch the invite
        const { data: inviteData, error: inviteError } = await supabase
          .from('invites')
          .select('*')
          .eq('code', code)
          .single();

        if (inviteError || !inviteData) {
          setError('This invite link is not valid or has expired.');
          setLoading(false);
          return;
        }

        setInvite(inviteData);

        // If invite is used, fetch the existing RSVP
        if (inviteData.used_by) {
          const { data: rsvpData } = await supabase
            .from('rsvps')
            .select('*')
            .eq('id', inviteData.used_by)
            .single();

          if (rsvpData) {
            setExistingRsvp({
              id: rsvpData.id,
              name: rsvpData.name || '',
              email: rsvpData.email || '',
              attending: rsvpData.attending ?? false,
              guests: rsvpData.guests || 1,
              meal_preference: rsvpData.meal_preference,
              song_requests: rsvpData.song_requests,
              message: rsvpData.message,
            });
          }
        }
      } catch (err) {
        console.error('Error validating invite:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    validateInvite();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invite) return;

    // Validate guest count
    if (formData.guests > invite.max_guests) {
      toast({
        title: 'Too many guests',
        description: `This invite allows up to ${invite.max_guests} guest(s).`,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Validate all guest names are filled
      const filledNames = formData.guestNames.slice(0, formData.guests).filter(n => n.trim());
      if (formData.attending && filledNames.length !== formData.guests) {
        toast({
          title: 'Missing guest names',
          description: 'Please enter names for all attending guests.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Create the RSVP with all guest names (stored as comma-separated in name field)
      const allNames = formData.guestNames.slice(0, formData.guests).map(n => n.trim()).join(', ');
      
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .insert({
          name: allNames,
          email: formData.email,
          attending: formData.attending,
          guests: formData.guests,
          meal_preference: formData.mealPreference || null,
          song_requests: formData.songRequests || null,
          message: formData.message || null,
          invite_code: invite.code,
        })
        .select()
        .single();

      if (rsvpError) throw rsvpError;

      // Mark the invite as used
      const { error: updateError } = await supabase
        .from('invites')
        .update({ used_by: rsvpData.id })
        .eq('id', invite.id);

      if (updateError) throw updateError;

      setSubmitted(true);
      toast({
        title: 'RSVP submitted!',
        description: formData.attending 
          ? "We can't wait to celebrate with you!" 
          : 'Thank you for letting us know.',
      });
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit RSVP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 max-w-md text-center"
          >
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl text-foreground mb-2">Invalid Invite</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (existingRsvp) {
    return (
      <Layout>
        <div className="min-h-screen py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-8">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="font-display text-3xl text-foreground mb-2">You've Already RSVP'd</h1>
              <p className="text-muted-foreground">Here are your RSVP details:</p>
            </div>

            <div className="glass-card rounded-2xl p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{existingRsvp.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{existingRsvp.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Attending</span>
                  <span className={`font-medium ${existingRsvp.attending ? 'text-sage' : 'text-destructive'}`}>
                    {existingRsvp.attending ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Number of Guests</span>
                  <span className="font-medium">{existingRsvp.guests}</span>
                </div>
                {existingRsvp.meal_preference && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Meal Preference</span>
                    <span className="font-medium">{existingRsvp.meal_preference}</span>
                  </div>
                )}
                {existingRsvp.song_requests && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Song Requests</span>
                    <span className="font-medium">{existingRsvp.song_requests}</span>
                  </div>
                )}
                {existingRsvp.message && (
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-2">Message</span>
                    <p className="text-foreground italic">"{existingRsvp.message}"</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Need to make changes? Please contact us directly.
              </p>

              <Link to="/" className="block">
                <Button className="w-full">Return to Website</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Check className="w-20 h-20 text-sage mx-auto mb-4" />
            </motion.div>
            <h1 className="font-display text-3xl text-foreground mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-6">
              {formData.attending 
                ? "We're so excited to celebrate with you!" 
                : "We'll miss you, but thank you for letting us know."}
            </p>
            <Link to="/">
              <Button>Explore the Wedding Website</Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl text-foreground mb-2">You're Invited!</h1>
            <p className="text-muted-foreground">
              {invite?.label ? `${invite.label} – ` : ''}
              Please RSVP for up to {invite?.max_guests} guest{invite?.max_guests !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Event Info */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">July 15, 2027</p>
                <p className="text-sm text-muted-foreground">4:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">The Grand Estate</p>
                <p className="text-sm text-muted-foreground">123 Wedding Lane, City</p>
              </div>
            </div>
          </div>

          {/* RSVP Form */}
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
            {/* Guest Names Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Guest Names *</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.guests} of {invite?.max_guests} guests
                </span>
              </div>
              
              {/* Number of guests selector first */}
              <Select
                value={formData.guests.toString()}
                onValueChange={(value) => updateGuestCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: invite?.max_guests || 1 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Name inputs for each guest */}
              <div className="space-y-3">
                {Array.from({ length: formData.guests }, (_, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`guest-${index}`} className="text-sm text-muted-foreground">
                      {index === 0 ? 'Primary Guest (You)' : `Guest ${index + 1}`}
                    </Label>
                    <Input
                      id={`guest-${index}`}
                      required
                      placeholder={index === 0 ? 'Enter your full name' : `Enter guest ${index + 1}'s full name`}
                      value={formData.guestNames[index] || ''}
                      onChange={(e) => updateGuestName(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Will you be attending? *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.attending ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, attending: true })}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Yes, I'll be there!
                </Button>
                <Button
                  type="button"
                  variant={!formData.attending ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, attending: false })}
                >
                  Sorry, can't make it
                </Button>
              </div>
            </div>

            {formData.attending && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="meal">Meal Preference</Label>
                  <Select
                    value={formData.mealPreference}
                    onValueChange={(value) => setFormData({ ...formData, mealPreference: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a meal option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beef">Beef</SelectItem>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="song">Song Request</Label>
                  <Input
                    id="song"
                    placeholder="What song will get you on the dance floor?"
                    value={formData.songRequests}
                    onChange={(e) => setFormData({ ...formData, songRequests: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message for the Couple</Label>
              <Textarea
                id="message"
                placeholder="Share your well wishes..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Submit RSVP
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
