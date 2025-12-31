import { useState } from 'react';
import { isAfterWeddingDate } from '@/lib/wedding-utils';
import { LockedPage } from '@/components/shared/LockedPage';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GuestMessage {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

const mockMessages: GuestMessage[] = [
  {
    id: '1',
    name: 'Sarah & Tom',
    content: 'Wishing you both a lifetime of love and happiness! We are so honored to be part of your special day. 💕',
    createdAt: '2027-07-02T16:30:00',
  },
  {
    id: '2',
    name: 'The Chen Family',
    content: 'May your love grow stronger with each passing day. Congratulations Eddie and Yasmine!',
    createdAt: '2027-07-02T17:15:00',
  },
];

const MessageWall = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<GuestMessage[]>(mockMessages);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAfterWeddingDate()) {
    return (
      <LockedPage
        title="Message Wall"
        description="Leave your wishes and messages for the happy couple - available on the wedding day!"
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMessage: GuestMessage = {
      id: Date.now().toString(),
      name: name.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages([newMessage, ...messages]);
    setName('');
    setContent('');
    setIsSubmitting(false);
    
    toast({
      title: "Message Sent!",
      description: "Your message will appear after approval.",
    });
  };

  return (
    <Layout>
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Guestbook"
            subtitle="Share your wishes and messages with the happy couple."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Message Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-6 mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-xl text-foreground">Leave a Message</h3>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Your message to Eddie & Yasmine..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />
                <Button
                  type="submit"
                  variant="romantic"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </motion.form>

            {/* Messages List */}
            <div className="space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-serif text-lg text-foreground mb-1">
                        {message.name}
                      </p>
                      <p className="text-muted-foreground mb-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(message.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MessageWall;
