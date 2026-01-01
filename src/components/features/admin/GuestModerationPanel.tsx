import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, Users } from 'lucide-react';

interface Guest {
  id: string;
  name?: string;
  email: string;
  attending?: boolean;
  plus_ones?: number;
  dietary_needs?: string;
}

interface GuestModerationPanelProps {
  guests: Guest[];
  isLoading?: boolean;
  onUpdateGuest?: (id: string, updates: Partial<Guest>) => Promise<void>;
  onDeleteGuest?: (id: string) => Promise<void>;
}

export const GuestModerationPanel = ({
  guests,
  isLoading = false,
  onUpdateGuest,
  onDeleteGuest,
}: GuestModerationPanelProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No guests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {guests.map((guest) => (
        <motion.div
          key={guest.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground truncate">
                {guest.name || 'Unnamed Guest'}
              </p>
              {guest.attending !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  guest.attending 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {guest.attending ? 'Attending' : 'Declined'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {guest.email}
              </span>
              {guest.plus_ones !== undefined && guest.plus_ones > 0 && (
                <span>+{guest.plus_ones} guests</span>
              )}
            </div>
            {guest.dietary_needs && (
              <p className="text-xs text-muted-foreground mt-1">
                Dietary: {guest.dietary_needs}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {guest.attending === null && onUpdateGuest && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdateGuest(guest.id, { attending: true })}
                  className="text-green-500 hover:text-green-600"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdateGuest(guest.id, { attending: false })}
                  className="text-red-500 hover:text-red-600"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
