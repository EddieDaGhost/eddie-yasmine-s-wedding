import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Check, AlertCircle, Loader2, Calendar, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { InviteReveal } from '@/components/features/invite';
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
  venue_name: string | null;
  venue_address: string | null;
  language: string;
}

const rsvpText = {
  en: {
    intro: 'With hearts full of love,',
    sub: 'invite you to share in the celebration of their wedding day',
    guestCount: (label: string | null, max: number) =>
      `${label ? `${label} – ` : ''}Please RSVP for up to ${max} guest${max !== 1 ? 's' : ''}`,
    date: 'July 2, 2027',
    time: '4:30 PM ET | 3:30 PM CT',
    attending: 'Will you be attending? *',
    yes: "Yes, I'll be there!",
    no: "Sorry, can't make it",
    guestNames: 'Guest Names *',
    guestsOf: (n: number, max: number) => `${n} of ${max} guests`,
    primaryGuest: 'Primary Guest (You)',
    guestN: (n: number) => `Guest ${n}`,
    guestPlaceholder: 'Enter your full name',
    guestNPlaceholder: (n: number) => `Enter guest ${n}'s full name`,
    email: 'Email Address',
    phone: 'Phone Number',
    contactHint: 'Please provide either an email address or a phone number so we can confirm your RSVP.',
    mealPrefs: 'Meal Preferences',
    yourMeal: 'Your meal',
    guestMeal: (n: number) => `Guest ${n}'s meal`,
    selectMeal: 'Select a meal option',
    beef: 'Beef',
    chicken: 'Chicken',
    fish: 'Fish',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    songRequest: 'Song Request',
    songPlaceholder: 'Artist - Song Title',
    message: 'Message for the Couple',
    messagePlaceholder: 'Share your well wishes...',
    submit: 'Submit RSVP',
    submitting: 'Submitting...',
    contactRequired: 'Contact info required',
    contactRequiredDesc: 'Please provide either an email address or a phone number.',
    tooManyGuests: 'Too many guests',
    tooManyGuestsDesc: (max: number) => `This invite allows up to ${max} guest(s).`,
    missingNames: 'Missing guest names',
    missingNamesDesc: 'Please enter names for all attending guests.',
    rsvpSubmitted: 'RSVP submitted!',
    rsvpExcited: "We're so excited to celebrate with you!",
    rsvpMiss: "We'll miss you, but thank you for letting us know.",
    thankYou: 'Thank You!',
    exploreWebsite: 'Explore the Wedding Website',
    alreadyRsvpd: "You've Already RSVP'd",
    alreadyDetails: 'Here are your RSVP details:',
    nameLabel: 'Name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    attendingLabel: 'Attending',
    attendingYes: 'Yes',
    attendingNo: 'No',
    numGuests: 'Number of Guests',
    mealLabel: 'Meal Preferences',
    songLabel: 'Song Requests',
    msgLabel: 'Message',
    needChanges: 'Need to make changes? Please contact us directly.',
    returnHome: 'Return to Website',
    invalidInvite: 'Invalid Invite',
    returnHomeBtn: 'Return Home',
    guestSelector: (n: number) => `${n} ${n === 1 ? 'guest' : 'guests'}`,
  },
  es: {
    intro: 'Con el corazón lleno de amor,',
    sub: 'los invitan a compartir la celebración de su boda',
    guestCount: (label: string | null, max: number) =>
      `${label ? `${label} – ` : ''}Por favor confirme para hasta ${max} invitado${max !== 1 ? 's' : ''}`,
    date: '2 de julio de 2027',
    time: '4:30 PM ET | 3:30 PM CT',
    attending: '¿Asistirá? *',
    yes: '¡Sí, estaré allí!',
    no: 'Lo siento, no podré asistir',
    guestNames: 'Nombres de invitados *',
    guestsOf: (n: number, max: number) => `${n} de ${max} invitados`,
    primaryGuest: 'Invitado principal (Tú)',
    guestN: (n: number) => `Invitado ${n}`,
    guestPlaceholder: 'Ingresa tu nombre completo',
    guestNPlaceholder: (n: number) => `Nombre del invitado ${n}`,
    email: 'Correo electrónico',
    phone: 'Número de teléfono',
    contactHint: 'Por favor proporciona un correo electrónico o número de teléfono para confirmar tu asistencia.',
    mealPrefs: 'Preferencias de comida',
    yourMeal: 'Tu comida',
    guestMeal: (n: number) => `Comida del invitado ${n}`,
    selectMeal: 'Selecciona una opción',
    beef: 'Carne de res',
    chicken: 'Pollo',
    fish: 'Pescado',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    songRequest: 'Canción solicitada',
    songPlaceholder: 'Artista - Título de la canción',
    message: 'Mensaje para los novios',
    messagePlaceholder: 'Comparte tus buenos deseos...',
    submit: 'Enviar confirmación',
    submitting: 'Enviando...',
    contactRequired: 'Información de contacto requerida',
    contactRequiredDesc: 'Por favor proporciona un correo electrónico o número de teléfono.',
    tooManyGuests: 'Demasiados invitados',
    tooManyGuestsDesc: (max: number) => `Esta invitación permite hasta ${max} invitado(s).`,
    missingNames: 'Faltan nombres de invitados',
    missingNamesDesc: 'Por favor ingresa los nombres de todos los invitados que asistirán.',
    rsvpSubmitted: '¡Confirmación enviada!',
    rsvpExcited: '¡Estamos muy emocionados de celebrar contigo!',
    rsvpMiss: 'Te echaremos de menos, pero gracias por avisarnos.',
    thankYou: '¡Gracias!',
    exploreWebsite: 'Explorar el sitio de la boda',
    alreadyRsvpd: 'Ya has confirmado tu asistencia',
    alreadyDetails: 'Aquí están los detalles de tu confirmación:',
    nameLabel: 'Nombre',
    emailLabel: 'Correo electrónico',
    phoneLabel: 'Teléfono',
    attendingLabel: 'Asistirá',
    attendingYes: 'Sí',
    attendingNo: 'No',
    numGuests: 'Número de invitados',
    mealLabel: 'Preferencias de comida',
    songLabel: 'Canciones solicitadas',
    msgLabel: 'Mensaje',
    needChanges: '¿Necesitas hacer cambios? Por favor contáctanos directamente.',
    returnHome: 'Volver al sitio web',
    invalidInvite: 'Invitación no válida',
    returnHomeBtn: 'Volver al inicio',
    guestSelector: (n: number) => `${n} ${n === 1 ? 'invitado' : 'invitados'}`,
  },
};

interface ExistingRSVP {
  id: string;
  name: string;
  email: string;
  phone: string;
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
  const lang = invite?.language ?? 'en';
  const t = rsvpText[lang as keyof typeof rsvpText] ?? rsvpText.en;
  const [existingRsvp, setExistingRsvp] = useState<ExistingRSVP | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    attending: true,
    guests: 1,
    guestNames: [''] as string[],
    mealPreferences: [''] as string[],
    songRequests: '',
    message: '',
  });

  // Update guest names and meal preferences arrays when guest count changes
  const updateGuestCount = (count: number) => {
    const newGuestNames = [...formData.guestNames];
    const newMealPreferences = [...formData.mealPreferences];
    if (count > newGuestNames.length) {
      while (newGuestNames.length < count) {
        newGuestNames.push('');
        newMealPreferences.push('');
      }
    } else {
      newGuestNames.length = count;
      newMealPreferences.length = count;
    }
    setFormData({ ...formData, guests: count, guestNames: newGuestNames, mealPreferences: newMealPreferences });
  };

  const updateGuestName = (index: number, name: string) => {
    const newGuestNames = [...formData.guestNames];
    newGuestNames[index] = name;
    setFormData({ ...formData, guestNames: newGuestNames });
  };

  const updateMealPreference = (index: number, meal: string) => {
    const newMealPreferences = [...formData.mealPreferences];
    newMealPreferences[index] = meal;
    setFormData({ ...formData, mealPreferences: newMealPreferences });
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

        // Remember this invite code so /rsvp can redirect back here
        localStorage.setItem('wedding_invite_code', code);

        // Track the view event
        await supabase.from('invite_analytics').insert({
          invite_id: inviteData.id,
          event_type: 'view',
        });

        // Check for existing RSVP — first by used_by, then by invite_code as fallback
        let rsvpData = null;
        if (inviteData.used_by) {
          const { data } = await supabase
            .from('rsvps')
            .select('*')
            .eq('id', inviteData.used_by)
            .single();
          rsvpData = data;
        }

        // Fallback: look up RSVP by invite_code in case the used_by update failed
        if (!rsvpData) {
          const { data } = await supabase
            .from('rsvps')
            .select('*')
            .eq('invite_code', code)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          rsvpData = data;

          // If we found an RSVP but used_by wasn't set, try to fix the link
          if (rsvpData && !inviteData.used_by) {
            await supabase
              .from('invites')
              .update({ used_by: rsvpData.id })
              .eq('id', inviteData.id);
          }
        }

        if (rsvpData) {
          setExistingRsvp({
            id: rsvpData.id,
            name: rsvpData.name || '',
            email: rsvpData.email || '',
            phone: rsvpData.phone || '',
            attending: rsvpData.attending ?? false,
            guests: rsvpData.guests || 1,
            meal_preference: rsvpData.meal_preference,
            song_requests: rsvpData.song_requests,
            message: rsvpData.message,
          });
        } else {
          // Only show animated intro for truly fresh invites
          setShowIntro(true);
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

    // Require at least email or phone
    if (!formData.email.trim() && !formData.phone.trim()) {
      toast({
        title: t.contactRequired,
        description: t.contactRequiredDesc,
        variant: 'destructive',
      });
      return;
    }

    // If declining, skip guest/name validation
    if (!formData.attending) {
      setSubmitting(true);
      try {
        const { data: rsvpData, error: rsvpError } = await supabase
          .from('rsvps')
          .insert({
            name: formData.guestNames[0]?.trim() || null,
            email: formData.email || null,
            phone: formData.phone || null,
            attending: false,
            guests: 1,
            meal_preference: null,
            song_requests: null,
            message: formData.message || null,
            invite_code: invite.code,
          })
          .select()
          .single();

        if (rsvpError) throw rsvpError;

        await supabase
          .from('invites')
          .update({ used_by: rsvpData.id })
          .eq('id', invite.id);

        await supabase.from('invite_analytics').insert({
          invite_id: invite.id,
          event_type: 'rsvp',
          metadata: { attending: false, guests: 1 },
        });

        setSubmitted(true);
        toast({
          title: 'RSVP submitted!',
          description: 'Thank you for letting us know.',
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
      return;
    }

    // Validate guest count
    if (formData.guests > invite.max_guests) {
      toast({
        title: t.tooManyGuests,
        description: t.tooManyGuestsDesc(invite.max_guests),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Validate all guest names are filled
      const filledNames = formData.guestNames.slice(0, formData.guests).filter(n => n.trim());
      if (filledNames.length !== formData.guests) {
        toast({
          title: t.missingNames,
          description: t.missingNamesDesc,
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Create the RSVP with all guest names (stored as comma-separated in name field)
      const allNames = formData.guestNames.slice(0, formData.guests).map(n => n.trim()).join(', ');

      // Build per-guest meal preferences string (e.g. "Eddie: Beef | Yasmine: Chicken")
      const mealParts = formData.guestNames.slice(0, formData.guests)
        .map((name, i) => {
          const meal = formData.mealPreferences[i];
          if (!meal) return null;
          return `${name.trim()}: ${meal.charAt(0).toUpperCase() + meal.slice(1)}`;
        })
        .filter(Boolean);
      const mealPreferenceStr = mealParts.length > 0 ? mealParts.join(' | ') : null;

      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .insert({
          name: allNames,
          email: formData.email || null,
          phone: formData.phone || null,
          attending: formData.attending,
          guests: formData.guests,
          meal_preference: mealPreferenceStr,
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

      // Track the RSVP submission event
      await supabase.from('invite_analytics').insert({
        invite_id: invite.id,
        event_type: 'rsvp',
        metadata: { attending: formData.attending, guests: formData.guests },
      });

      setSubmitted(true);
      toast({
        title: t.rsvpSubmitted,
        description: formData.attending ? t.rsvpExcited : t.rsvpMiss,
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
            <h1 className="font-display text-2xl text-foreground mb-2">{t.invalidInvite}</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>{t.returnHomeBtn}</Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (showIntro && invite) {
    return (
      <AnimatePresence mode="wait">
        <InviteReveal
          key="invite-reveal"
          label={invite.label || 'Dear Guest'}
          onComplete={() => setShowIntro(false)}
          venueName={invite.venue_name || undefined}
          venueAddress={invite.venue_address || undefined}
          language={invite.language || 'en'}
        />
      </AnimatePresence>
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
              <h1 className="font-display text-3xl text-foreground mb-2">{t.alreadyRsvpd}</h1>
              <p className="text-muted-foreground">{t.alreadyDetails}</p>
            </div>

            <div className="glass-card rounded-2xl p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t.nameLabel}</span>
                  <span className="font-medium">{existingRsvp.name}</span>
                </div>
                {existingRsvp.email && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t.emailLabel}</span>
                    <span className="font-medium">{existingRsvp.email}</span>
                  </div>
                )}
                {existingRsvp.phone && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t.phoneLabel}</span>
                    <span className="font-medium">{existingRsvp.phone}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t.attendingLabel}</span>
                  <span className={`font-medium ${existingRsvp.attending ? 'text-sage' : 'text-destructive'}`}>
                    {existingRsvp.attending ? t.attendingYes : t.attendingNo}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t.numGuests}</span>
                  <span className="font-medium">{existingRsvp.guests}</span>
                </div>
                {existingRsvp.meal_preference && (
                  <div className="py-2 border-b border-border">
                    <span className="text-muted-foreground block mb-2">{t.mealLabel}</span>
                    {existingRsvp.meal_preference.includes('|') ? (
                      <div className="space-y-1">
                        {existingRsvp.meal_preference.split('|').map((entry, i) => (
                          <p key={i} className="font-medium text-sm">{entry.trim()}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium">{existingRsvp.meal_preference}</p>
                    )}
                  </div>
                )}
                {existingRsvp.song_requests && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t.songLabel}</span>
                    <span className="font-medium">{existingRsvp.song_requests}</span>
                  </div>
                )}
                {existingRsvp.message && (
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-2">{t.msgLabel}</span>
                    <p className="text-foreground italic">"{existingRsvp.message}"</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                {t.needChanges}
              </p>

              <Link to="/" className="block">
                <Button className="w-full">{t.returnHome}</Button>
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
            <h1 className="font-display text-3xl text-foreground mb-2">{t.thankYou}</h1>
            <p className="text-muted-foreground mb-6">
              {formData.attending ? t.rsvpExcited : t.rsvpMiss}
            </p>
            <Link to="/">
              <Button>{t.exploreWebsite}</Button>
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
          {/* Header - styled to match InviteReveal */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-6"
            />
            <p className="font-serif italic text-base text-muted-foreground/80 mb-3">
              {t.intro}
            </p>
            <h1
              className="font-display italic text-4xl md:text-5xl text-primary mb-3"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
            >
              Eddie <span className="gold-shimmer text-3xl md:text-4xl">&amp;</span> Yasmine
            </h1>
            <p className="font-serif italic text-base text-muted-foreground/80 mb-4">
              {t.sub}
            </p>
            <p className="text-muted-foreground">
              {invite ? t.guestCount(invite.label, invite.max_guests) : ''}
            </p>
          </div>

          {/* Event Info */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">{t.date}</p>
                <p className="text-sm text-muted-foreground">{t.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">{invite?.venue_name || 'Blue Dress Barn'}</p>
                <p className="text-sm text-muted-foreground">{invite?.venue_address || 'Benton Harbor, Michigan'}</p>
              </div>
            </div>
          </div>

          {/* RSVP Form */}
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
            {/* Attending Toggle */}
            <div className="space-y-2">
              <Label>{t.attending}</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formData.attending ? 'default' : 'outline'}
                  className="h-12 text-sm font-medium"
                  onClick={() => setFormData({ ...formData, attending: true })}
                >
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{t.yes}</span>
                </Button>
                <Button
                  type="button"
                  variant={!formData.attending ? 'default' : 'outline'}
                  className="h-12 text-sm font-medium"
                  onClick={() => setFormData({ ...formData, attending: false })}
                >
                  <span className="truncate">{t.no}</span>
                </Button>
              </div>
            </div>

            {/* Guest Names Section - only when attending */}
            {formData.attending && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t.guestNames}</Label>
                  <span className="text-xs text-muted-foreground">
                    {invite ? t.guestsOf(formData.guests, invite.max_guests) : ''}
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
                        {t.guestSelector(num)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Name inputs for each guest */}
                <div className="space-y-3">
                  {Array.from({ length: formData.guests }, (_, index) => (
                    <div key={index} className="space-y-1">
                      <Label htmlFor={`guest-${index}`} className="text-sm text-muted-foreground">
                        {index === 0 ? t.primaryGuest : t.guestN(index + 1)}
                      </Label>
                      <Input
                        id={`guest-${index}`}
                        required
                        placeholder={index === 0 ? t.guestPlaceholder : t.guestNPlaceholder(index + 1)}
                        value={formData.guestNames[index] || ''}
                        onChange={(e) => updateGuestName(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Helper text for email/phone */}
            <p className="text-xs text-muted-foreground/70 -mt-4">
              {t.contactHint}
            </p>

            {formData.attending && (
              <>
                <div className="space-y-4">
                  <Label>{t.mealPrefs}</Label>
                  {Array.from({ length: formData.guests }, (_, index) => (
                    <div key={index} className="space-y-1">
                      <Label htmlFor={`meal-${index}`} className="text-sm text-muted-foreground">
                        {formData.guestNames[index]?.trim() || (index === 0 ? t.yourMeal : t.guestMeal(index + 1))}
                      </Label>
                      <Select
                        value={formData.mealPreferences[index] || ''}
                        onValueChange={(value) => updateMealPreference(index, value)}
                      >
                        <SelectTrigger id={`meal-${index}`}>
                          <SelectValue placeholder={t.selectMeal} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beef">{t.beef}</SelectItem>
                          <SelectItem value="chicken">{t.chicken}</SelectItem>
                          <SelectItem value="fish">{t.fish}</SelectItem>
                          <SelectItem value="vegetarian">{t.vegetarian}</SelectItem>
                          <SelectItem value="vegan">{t.vegan}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="song">{t.songRequest}</Label>
                  <Input
                    id="song"
                    placeholder={t.songPlaceholder}
                    value={formData.songRequests}
                    onChange={(e) => setFormData({ ...formData, songRequests: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">{t.message}</Label>
              <Textarea
                id="message"
                placeholder={t.messagePlaceholder}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  {t.submit}
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
