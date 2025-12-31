// Wedding date configuration
export const WEDDING_DATE = new Date('2027-07-02T00:00:00');

export const isAfterWeddingDate = (): boolean => {
  return new Date() >= WEDDING_DATE;
};

export const getTimeUntilWedding = () => {
  const now = new Date();
  const diff = WEDDING_DATE.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isWeddingDay: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isWeddingDay: false };
};

export const formatWeddingDate = (): string => {
  return WEDDING_DATE.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Guest data types
export interface Guest {
  id: string;
  name: string;
  email: string;
  invite_code: string;
  attending: boolean | null;
  plus_ones: number;
  dietary_needs: string | null;
  song_request: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  guest_id: string | null;
  guest_name: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export interface Photo {
  id: string;
  guest_id: string | null;
  file_url: string;
  caption: string | null;
  approved: boolean;
  created_at: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
}

// Wedding Party Member
export interface WeddingPartyMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

// Timeline Event
export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image?: string;
}
