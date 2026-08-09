import { useEffect, useMemo } from 'react';
import { CalendarPlus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddToCalendarProps {
  venueName?: string | null;
  venueAddress?: string | null;
  language?: string;
}

// July 2, 2027, 4:30 PM – 11:00 PM Eastern. July is EDT (UTC-4), so the
// event runs 20:30 UTC to 03:00 UTC the following day.
const EVENT_START_UTC = '20270702T203000Z';
const EVENT_END_UTC = '20270703T030000Z';

const calendarText = {
  en: {
    heading: 'Add to your calendar',
    add: 'Add to Calendar',
    google: 'Prefer Google Calendar?',
    title: 'Eddie & Yasmine — Wedding',
    description: "We can't wait to celebrate with you!",
  },
  es: {
    heading: 'Agregar a tu calendario',
    add: 'Agregar al calendario',
    google: '¿Prefieres Google Calendar?',
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

  // One .ics link serves both platforms. iOS Safari hands it to Calendar and
  // shows the Add Event sheet; Android offers the installed calendar apps.
  // Both require a real URL served as text/calendar with no `download`
  // attribute — a data: URI or a forced download breaks each of them.
  //
  // The static file at /wedding.ics covers every invite that doesn't override
  // the venue.
  const hasCustomVenue = Boolean(venueName || venueAddress);

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

  const icsHref = customVenueHref ?? '/wedding.ics';

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
        <CalendarPlus className="w-4 h-4" />
        {t.heading}
      </p>

      {/* No `download` attribute — it stops both iOS and Android from handing
          the file to a calendar app. */}
      <Button asChild className="w-full">
        <a href={icsHref} rel="noopener" className="gap-2">
          <Calendar className="w-4 h-4" />
          {t.add}
        </a>
      </Button>

      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        {t.google}
      </a>
    </div>
  );
};
