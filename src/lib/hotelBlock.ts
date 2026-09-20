// Wedding hotel room block.
//
// Single source of truth: these details appear on the Travel page, the FAQ, the
// home page callout and the invite RSVP confirmation. Keeping them here means a
// rate or deadline change is one edit rather than four.
//
// The wedding is Friday, July 2, 2027 — July 4th weekend — which is why the
// Friday through Sunday rates are well above Thursday's.

export const HOTEL_BLOCK = {
  name: 'Hilton Garden Inn Benton Harbor',
  distance: '10 min from venue',
  bookingUrl:
    'https://www.hilton.com/en/attend-my-event/behcwgi-911-346385e0-80dd-4689-a854-4ad5fd63824c/',
  /** Last day Hilton will honour the block. Rooms may sell out well before this. */
  bookByLabel: 'June 2, 2027',
  rates: [
    { night: 'Thursday', price: '$129', note: 'Best value for an early arrival' },
    { night: 'Friday', price: '$224', note: 'Wedding night' },
    { night: 'Saturday', price: '$224' },
    { night: 'Sunday', price: '$224' },
  ] as const satisfies ReadonlyArray<{ night: string; price: string; note?: string }>,
} as const;
