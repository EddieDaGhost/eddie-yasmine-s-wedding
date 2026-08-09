import { useEffect, useMemo } from 'react';
import { CalendarPlus, Apple, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddToCalendarProps {
  venueName?: string | null;
  venueAddress?: string | null;
  language?: string;
}

// Ceremony: July 2, 2027, 4:30 PM Eastern (EDT = UTC-4) → 20:30 UTC.
// Held for five hours through the reception.
const EVENT_START_UTC = '20270702T203000Z';
const EVENT_END_UTC = '20270703T013000Z';

const calendarText = {
  en: {
    heading: 'Add to your calendar',
    apple: 'iPhone / Apple',
    google: 'Android / Google',
    title: 'Eddie & Yasmine — Wedding',
    description: "We can't wait to celebrate with you!",
  },
  es: {
    heading: 'Agregar a tu calendario',
    apple: 'iPhone / Apple',
    google: 'Android / Google',
    title: 'Eddie & Yasmine — Boda',
    description: '¡No podemos esperar para celebrar contigo!',
  },
};

export const AddToCalendar = ({ venueName, venueAddress, language = 'en' }: AddToCalendarProps) => {
  const t = calendarText[language as keyof typeof calendarText] ?? calendarText.en;

  const location = [venueName, venueAddress].filter(Boolean).join(', ');

  const googleUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(t.title)}` +
    `&dates=${EVENT_START_UTC}/${EVENT_END_UTC}` +
    `&details=${encodeURIComponent(t.description)}` +
    (location ? `&location=${encodeURIComponent(location)}` : '');

  // A plain link to a real .ics URL is what iOS needs: Safari hands it to
  // Calendar and shows the Add Event sheet. A data: URI or a `download`
  // attribute both defeat that, leaving the guest with a file they have to
  // find in Downloads. The static file at /wedding.ics carries the venue for
  // the wedding itself, so it covers every invite without a custom venue.
  const hasCustomVenue = Boolean(venueName || venueAddress);

  // Only invites overriding the venue need a generated file.
  const buildIcs = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Eddie and Yasmine//Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@eddie-and-yasmine.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${EVENT_START_UTC}`,
      `DTEND:${EVENT_END_UTC}`,
      `SUMMARY:${t.title}`,
      `DESCRIPTION:${t.description}`,
      location ? `LOCATION:${location.replace(/,/g, '\\,')}` : '',
      'BEGIN:VALARM',
      'TRIGGER:-P1W',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);

    return lines.join('\r\n');
  };

  // A blob URL keeps the text/calendar type, which a data: URI loses on iOS.
  // Built once and revoked on unmount so repeated renders don't leak.
  const customVenueHref = useMemo(
    () =>
      hasCustomVenue
        ? URL.createObjectURL(new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' }))
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasCustomVenue, location, t.title, t.description]
  );

  useEffect(
    () => () => {
      if (customVenueHref) URL.revokeObjectURL(customVenueHref);
    },
    [customVenueHref]
  );

  const appleHref = customVenueHref ?? '/wedding.ics';

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
        <CalendarPlus className="w-4 h-4" />
        {t.heading}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" asChild className="flex-1">
          {/* No `download` attribute: it stops iOS handing the file to Calendar. */}
          <a href={appleHref} rel="noopener" className="gap-2">
            <Apple className="w-4 h-4" />
            {t.apple}
          </a>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
            <Calendar className="w-4 h-4" />
            {t.google}
          </a>
        </Button>
      </div>
    </div>
  );
};
