// Canonical wedding facts.
//
// These strings appear across guest-facing pages, the printed-invite preview
// and the calendar file. They used to be copy-pasted, which is how the venue
// address drifted into two different — and both incorrect — values. Anything a
// guest could act on belongs here, not inline.
//
// Follows the pattern established by src/lib/hotelBlock.ts.

import { WEDDING_DATE } from './wedding-utils';

export { WEDDING_DATE };

export const VENUE = {
  name: 'Blue Dress Barn',
  street: '3893 Territorial Rd',
  cityStateZip: 'Benton Harbor, Michigan 49022',
  /** Single line, for inline prose and the .ics LOCATION field. */
  get full() {
    return `${this.street}, ${this.cityStateZip}`;
  },
  /** Turn-by-turn directions. */
  get directionsUrl() {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${this.name}, ${this.street}, ${this.cityStateZip}`
    )}`;
  },
  /** Embeddable map, centred on the venue. */
  get mapEmbedUrl() {
    return `https://maps.google.com/maps?width=600&height=400&hl=en&q=${encodeURIComponent(
      `${this.name}, ${this.street}, ${this.cityStateZip}`
    )}&t=&z=14&ie=UTF8&iwloc=B&output=embed`;
  },
} as const;

export const CEREMONY = {
  /** Doors open half an hour before the ceremony. */
  doorsLabel: '4:00 PM',
  timeLabel: '4:30 PM',
  timeWithZones: '4:30 PM ET | 3:30 PM CT',
  dateLabel: 'July 2, 2027',
  dateLabelEs: '2 de julio de 2027',
} as const;

/** Guests must respond by this date. Stated on /rsvp and in the FAQ. */
export const RSVP_DEADLINE = {
  label: 'May 15, 2027',
  labelLong: 'May 15th, 2027',
} as const;

export const CONTACT = {
  email: 'eddieandyasmine@outlook.com',
  /** TODO: replace with the couple's handle once supplied. */
  instagramUrl: 'https://instagram.com',
} as const;
