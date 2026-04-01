import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InviteMessageTemplatesProps {
  label: string;
  url: string;
}

interface Template {
  name: string;
  style: string;
  generate: (label: string, url: string) => string;
}

const templates: Template[] = [
  {
    name: 'Formal',
    style: 'border-primary/30',
    generate: (label, url) =>
      `Dear ${label},\n\nYou are cordially invited to the wedding of Eddie & Yasmine on July 2, 2027 at 4:30 PM ET | 3:30 PM CT.\n\nPlease RSVP using your personal invitation link:\n${url}\n\nWe look forward to celebrating with you!\n\nWith love,\nEddie & Yasmine`,
  },
  {
    name: 'Casual',
    style: 'border-amber-500/30',
    generate: (label, url) =>
      `Hey ${label}! 🎉\n\nWe're getting married and we'd love for you to be there!\n\nJuly 2, 2027 • 4:30 PM ET | 3:30 PM CT\n\nRSVP here: ${url}\n\nCan't wait to celebrate with you!\n— Eddie & Yasmine`,
  },
  {
    name: 'Reminder',
    style: 'border-blue-500/30',
    generate: (label, url) =>
      `Hi ${label},\n\nJust a friendly reminder to RSVP for our wedding! We want to make sure we have an accurate headcount.\n\nDate: July 2, 2027 at 4:30 PM ET | 3:30 PM CT\n\nYour personal RSVP link: ${url}\n\nThank you!\nEddie & Yasmine`,
  },
  {
    name: 'Short (SMS/WhatsApp)',
    style: 'border-green-500/30',
    generate: (label, url) =>
      `Hi ${label}! You're invited to Eddie & Yasmine's wedding on July 2, 2027! RSVP here: ${url}`,
  },
];

export const InviteMessageTemplates = ({ label, url }: InviteMessageTemplatesProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyTemplate = (index: number) => {
    const text = templates[index].generate(label, url);
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a message template to copy and send to your guest. The personalized link is included.
      </p>
      {templates.map((tpl, i) => {
        const message = tpl.generate(label, url);
        return (
          <div
            key={tpl.name}
            className={cn(
              'border rounded-lg p-4 space-y-3 transition-colors',
              tpl.style
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{tpl.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyTemplate(i)}
                className="h-8"
              >
                {copiedIndex === i ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded p-3 max-h-[160px] overflow-y-auto">
              {message}
            </pre>
          </div>
        );
      })}
    </div>
  );
};
