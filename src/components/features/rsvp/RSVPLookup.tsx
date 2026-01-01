import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animation';
import { Search } from 'lucide-react';

interface RSVPLookupProps {
  onLookup?: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export const RSVPLookup = ({ onLookup, isLoading = false }: RSVPLookupProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onLookup) {
      await onLookup(email);
    }
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="lookup-email">Already RSVP'd? Look up your response</Label>
          <div className="flex gap-2">
            <Input
              id="lookup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <Button type="submit" variant="outline" disabled={isLoading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </FadeIn>
  );
};
