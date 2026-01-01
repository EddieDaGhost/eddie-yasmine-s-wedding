import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animation';
import { Send } from 'lucide-react';

interface GuestbookFormData {
  name: string;
  message: string;
}

interface GuestbookFormProps {
  onSubmit?: (data: GuestbookFormData) => Promise<void>;
  isLoading?: boolean;
}

export const GuestbookForm = ({ onSubmit, isLoading = false }: GuestbookFormProps) => {
  const [formData, setFormData] = useState<GuestbookFormData>({
    name: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
      setFormData({ name: '', message: '' });
    }
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="guestbook-name">Your Name</Label>
          <Input
            id="guestbook-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestbook-message">Your Message</Label>
          <Textarea
            id="guestbook-message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Leave a message for the happy couple..."
            rows={4}
            required
          />
        </div>

        <Button
          type="submit"
          variant="romantic"
          className="w-full"
          disabled={isLoading}
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </FadeIn>
  );
};
