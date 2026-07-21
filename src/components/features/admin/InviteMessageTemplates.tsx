import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InviteMessageTemplatesProps {
  label: string;
  url: string;
  language?: string;
}

interface Template {
  name: string;
  style: string;
  generate: (label: string, url: string) => string;
}

const templates: Record<string, Template[]> = {
  en: [
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
  ],
  es: [
    {
      name: 'Formal',
      style: 'border-primary/30',
      generate: (label, url) =>
        `Estimado/a ${label},\n\nTenemos el honor de invitarle a la boda de Eddie & Yasmine el 2 de julio de 2027 a las 4:30 PM ET | 3:30 PM CT.\n\nPor favor confirme su asistencia a través de su enlace personal:\n${url}\n\n¡Esperamos celebrar con usted!\n\nCon amor,\nEddie & Yasmine`,
    },
    {
      name: 'Casual',
      style: 'border-amber-500/30',
      generate: (label, url) =>
        `¡Hola ${label}! 🎉\n\n¡Nos casamos y nos encantaría que estuvieras ahí!\n\n2 de julio de 2027 • 4:30 PM ET | 3:30 PM CT\n\nConfirma aquí: ${url}\n\n¡No podemos esperar para celebrar contigo!\n— Eddie & Yasmine`,
    },
    {
      name: 'Recordatorio',
      style: 'border-blue-500/30',
      generate: (label, url) =>
        `Hola ${label},\n\nSolo un recordatorio amistoso para confirmar tu asistencia a nuestra boda. Queremos asegurarnos de tener un conteo exacto.\n\nFecha: 2 de julio de 2027 a las 4:30 PM ET | 3:30 PM CT\n\nTu enlace personal: ${url}\n\n¡Gracias!\nEddie & Yasmine`,
    },
    {
      name: 'Corto (SMS/WhatsApp)',
      style: 'border-green-500/30',
      generate: (label, url) =>
        `¡Hola ${label}! Estás invitado/a a la boda de Eddie & Yasmine el 2 de julio de 2027. Confirma aquí: ${url}`,
    },
  ],
};

export const InviteMessageTemplates = ({ label, url, language = 'en' }: InviteMessageTemplatesProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const activeTemplates = templates[language as keyof typeof templates] ?? templates.en;

  const copyTemplate = (index: number) => {
    const text = activeTemplates[index].generate(label, url);
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a message template to copy and send to your guest. The personalized link is included.
      </p>
      {activeTemplates.map((tpl, i) => {
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
