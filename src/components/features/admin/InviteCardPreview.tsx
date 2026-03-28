import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InviteCardPreviewProps {
  label: string;
  url: string;
  venueName?: string;
  venueAddress?: string;
  customMessage?: string;
}

const CARD_W = 900;
const CARD_H = 1260;
const QR_SIZE = 180;

export const InviteCardPreview = ({
  label,
  url,
  venueName = 'Blue Dress Barn',
  venueAddress = 'Benton Harbor, Michigan',
  customMessage,
}: InviteCardPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = CARD_W;
      canvas.height = CARD_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Wait for fonts
      await document.fonts.ready;

      // Background
      ctx.fillStyle = '#faf8f5';
      ctx.fillRect(0, 0, CARD_W, CARD_H);

      // Decorative border
      ctx.strokeStyle = '#c9a96e';
      ctx.lineWidth = 2;
      const m = 40;
      ctx.strokeRect(m, m, CARD_W - m * 2, CARD_H - m * 2);

      // Inner thin border
      ctx.strokeStyle = '#c9a96e40';
      ctx.lineWidth = 1;
      const m2 = 52;
      ctx.strokeRect(m2, m2, CARD_W - m2 * 2, CARD_H - m2 * 2);

      // Top ornament line
      const cx = CARD_W / 2;
      ctx.strokeStyle = '#c9a96e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 80, 120);
      ctx.lineTo(cx + 80, 120);
      ctx.stroke();

      // "Together with their families"
      ctx.fillStyle = '#8a8580';
      ctx.font = '14px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('TOGETHER WITH THEIR FAMILIES', cx, 170);

      // Couple names
      ctx.fillStyle = '#2a2520';
      ctx.font = '72px "Cormorant Garamond", "Playfair Display", serif';
      ctx.fillText('Eddie', cx, 280);
      ctx.fillStyle = '#c9a96e';
      ctx.font = 'italic 48px "Cormorant Garamond", "Playfair Display", serif';
      ctx.fillText('&', cx, 340);
      ctx.fillStyle = '#2a2520';
      ctx.font = '72px "Cormorant Garamond", "Playfair Display", serif';
      ctx.fillText('Yasmine', cx, 420);

      // "request the pleasure of your company"
      ctx.fillStyle = '#8a8580';
      ctx.font = 'italic 18px "Cormorant Garamond", serif';
      ctx.fillText('request the pleasure of your company', cx, 480);

      // Divider
      ctx.strokeStyle = '#c9a96e60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 60, 510);
      ctx.lineTo(cx + 60, 510);
      ctx.stroke();

      // Guest name
      ctx.fillStyle = '#c9a96e';
      ctx.font = '52px "Cormorant Garamond", "Playfair Display", serif';
      // Wrap long names
      const maxNameWidth = CARD_W - 140;
      if (ctx.measureText(label).width > maxNameWidth) {
        ctx.font = '38px "Cormorant Garamond", "Playfair Display", serif';
      }
      ctx.fillText(label, cx, 580);

      // Divider
      ctx.strokeStyle = '#c9a96e60';
      ctx.beginPath();
      ctx.moveTo(cx - 60, 610);
      ctx.lineTo(cx + 60, 610);
      ctx.stroke();

      // Date
      ctx.fillStyle = '#2a2520';
      ctx.font = '28px "Cormorant Garamond", serif';
      ctx.fillText('July 2, 2027', cx, 670);

      ctx.fillStyle = '#8a8580';
      ctx.font = '16px "Montserrat", sans-serif';
      ctx.fillText('4PM ET | 3PM CT', cx, 700);

      // Venue
      ctx.fillStyle = '#2a2520';
      ctx.font = '22px "Cormorant Garamond", serif';
      ctx.fillText(venueName, cx, 750);

      ctx.fillStyle = '#8a8580';
      ctx.font = '16px "Montserrat", sans-serif';
      ctx.fillText(venueAddress, cx, 780);

      // Custom message
      if (customMessage) {
        ctx.fillStyle = '#8a8580';
        ctx.font = 'italic 16px "Cormorant Garamond", serif';
        // Wrap text if needed
        const words = customMessage.split(' ');
        let line = '';
        let y = 830;
        const maxWidth = CARD_W - 160;
        for (const word of words) {
          const test = line + (line ? ' ' : '') + word;
          if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, cx, y);
            line = word;
            y += 24;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, cx, y);
      }

      // QR Code
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: QR_SIZE,
        margin: 1,
        color: { dark: '#2a2520', light: '#faf8f5' },
      });

      const qrImg = new Image();
      qrImg.onload = () => {
        const qrY = CARD_H - QR_SIZE - 140;
        ctx.drawImage(qrImg, cx - QR_SIZE / 2, qrY, QR_SIZE, QR_SIZE);

        // "Scan to RSVP" label
        ctx.fillStyle = '#8a8580';
        ctx.font = '13px "Montserrat", sans-serif';
        ctx.fillText('SCAN TO RSVP', cx, qrY + QR_SIZE + 28);

        // Bottom ornament
        ctx.strokeStyle = '#c9a96e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 80, CARD_H - 70);
        ctx.lineTo(cx + 80, CARD_H - 70);
        ctx.stroke();

        setReady(true);
      };
      qrImg.src = qrDataUrl;
    };

    draw();
  }, [label, url, venueName, venueAddress, customMessage]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `invite-card-${label.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Invite Card - ${label}</title>
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh}
      img{max-width:100%;max-height:100vh}@media print{body{margin:0}img{max-width:5in;max-height:7in}}</style>
      </head><body><img src="${dataUrl}" /><script>window.onload=()=>window.print()</script></body></html>
    `);
    win.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="border border-border rounded-lg overflow-hidden shadow-lg bg-white">
        <canvas
          ref={canvasRef}
          className={ready ? '' : 'invisible'}
          style={{ width: CARD_W / 2, height: CARD_H / 2 }}
        />
        {!ready && (
          <div
            className="flex items-center justify-center"
            style={{ width: CARD_W / 2, height: CARD_H / 2 }}
          >
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleDownload} disabled={!ready}>
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
        <Button variant="outline" onClick={handlePrint} disabled={!ready}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
};
