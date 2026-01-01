import { GuestbookMessage } from './GuestbookMessage';
import { StaggerContainer } from '@/components/animation';

interface Message {
  id: string;
  guest_id?: string;
  content: string;
  created_at: string;
  guest_name?: string;
}

interface GuestbookListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const GuestbookList = ({ messages, isLoading = false }: GuestbookListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-6 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No messages yet. Be the first to leave one!</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-4">
      {messages.map((message) => (
        <GuestbookMessage
          key={message.id}
          id={message.id}
          name={message.guest_name || 'Anonymous Guest'}
          content={message.content || ''}
          createdAt={message.created_at}
        />
      ))}
    </StaggerContainer>
  );
};
