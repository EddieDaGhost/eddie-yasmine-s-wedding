import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InviteQRCodeProps {
  url: string;
  label?: string;
  size?: number;
}

export const InviteQRCode = ({ url, label, size = 256 }: InviteQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    }).then(() => setReady(true));
  }, [url, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `invite-qr-${label?.replace(/\s+/g, '-').toLowerCase() || 'code'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
        <canvas ref={canvasRef} className={ready ? '' : 'invisible'} />
        {!ready && (
          <div className="flex items-center justify-center" style={{ width: size, height: size }}>
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {label && (
        <p className="text-sm text-muted-foreground text-center font-medium">{label}</p>
      )}
      <p className="text-xs text-muted-foreground text-center break-all max-w-[280px]">{url}</p>
      <Button variant="outline" size="sm" onClick={handleDownload} disabled={!ready}>
        <Download className="w-4 h-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  );
};
