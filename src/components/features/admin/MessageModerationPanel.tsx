import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content?: string;
  guest_name?: string;
  approved?: boolean;
  created_at: string;
}

interface MessageModerationPanelProps {
  messages: Message[];
  isLoading?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const MessageModerationPanel = ({
  messages,
  isLoading = false,
  onApprove,
  onReject,
  onDelete,
}: MessageModerationPanelProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No messages to moderate</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-card border border-border rounded-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-foreground">
                  {message.guest_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                {message.approved !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    message.approved 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {message.approved ? 'Approved' : 'Pending'}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{message.content}</p>
            </div>
            
            <div className="flex items-center gap-1">
              {!message.approved && onApprove && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApprove(message.id)}
                  className="text-green-500 hover:text-green-600"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
              {message.approved && onReject && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReject(message.id)}
                  className="text-amber-500 hover:text-amber-600"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(message.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
