import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Download, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Invite {
  id: string;
  code: string;
  label: string | null;
}

interface StickerSheetDownloadProps {
  invites: Invite[];
}

type PageSize = 'letter' | 'a4';
type Orientation = 'portrait' | 'landscape';

interface StickerConfig {
  pageSize: PageSize;
  orientation: Orientation;
  cols: number;
  rows: number;
  stickerWidthIn: number;
  stickerHeightIn: number;
  marginTopIn: number;
  marginLeftIn: number;
  gutterHIn: number;
  gutterVIn: number;
  showLabel: boolean;
  labelFontSizePt: number;
  qrPaddingIn: number;
}

const DEFAULTS: StickerConfig = {
  pageSize: 'letter',
  orientation: 'portrait',
  cols: 5,
  rows: 6,
  stickerWidthIn: 1.25,
  stickerHeightIn: 1.25,
  marginTopIn: 0.5,
  marginLeftIn: 0.875,
  gutterHIn: 0.125,
  gutterVIn: 0.375,
  showLabel: true,
  labelFontSizePt: 6,
  qrPaddingIn: 0.05,
};

// Presets
const PRESETS: { label: string; config: Partial<StickerConfig> }[] = [
  {
    label: 'Dashleigh 8443 — 1.25"×1.25", 5×6 (30/sheet)',
    config: { cols: 5, rows: 6, stickerWidthIn: 1.25, stickerHeightIn: 1.25, marginTopIn: 0.5, marginLeftIn: 0.875, gutterHIn: 0.125, gutterVIn: 0.375 },
  },
  {
    label: 'Avery 22807 — 2"×2", 4×5 (20/sheet)',
    config: { cols: 4, rows: 5, stickerWidthIn: 2, stickerHeightIn: 2, marginTopIn: 0.5, marginLeftIn: 0.19, gutterHIn: 0, gutterVIn: 0 },
  },
  {
    label: 'Avery 5164 — 3.33"×4", 2×3',
    config: { cols: 2, rows: 3, stickerWidthIn: 3.33, stickerHeightIn: 4, marginTopIn: 0.5, marginLeftIn: 0.17, gutterHIn: 0.17, gutterVIn: 0 },
  },
  {
    label: 'Avery 5160 — 2.63"×1", 3×10',
    config: { cols: 3, rows: 10, stickerWidthIn: 2.63, stickerHeightIn: 1, marginTopIn: 0.5, marginLeftIn: 0.19, gutterHIn: 0.12, gutterVIn: 0 },
  },
  {
    label: 'Custom',
    config: {},
  },
];

function getPageDimsIn(size: PageSize, orientation: Orientation): [number, number] {
  const dims: Record<PageSize, [number, number]> = {
    letter: [8.5, 11],
    a4: [8.27, 11.69],
  };
  const [w, h] = dims[size];
  return orientation === 'portrait' ? [w, h] : [h, w];
}

async function generateStickerPDF(invites: Invite[], config: StickerConfig, baseUrl: string): Promise<void> {
  const PX_PER_IN = 96;
  const PT_PER_IN = 72;

  const [pageWIn, pageHIn] = getPageDimsIn(config.pageSize, config.orientation);

  const doc = new jsPDF({
    orientation: config.orientation,
    unit: 'in',
    format: config.pageSize === 'letter' ? [8.5, 11] : 'a4',
  });

  const stickersPerPage = config.cols * config.rows;
  const totalPages = Math.ceil(invites.length / stickersPerPage);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage();

    const pageInvites = invites.slice(page * stickersPerPage, (page + 1) * stickersPerPage);

    for (let i = 0; i < pageInvites.length; i++) {
      const invite = pageInvites[i];
      const col = i % config.cols;
      const row = Math.floor(i / config.cols);

      const x = config.marginLeftIn + col * (config.stickerWidthIn + config.gutterHIn);
      const y = config.marginTopIn + row * (config.stickerHeightIn + config.gutterVIn);

      const url = `${baseUrl}/invite/${invite.code}`;

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: Math.round(config.stickerWidthIn * PX_PER_IN),
        margin: 1,
        color: { dark: '#1a1a1a', light: '#ffffff' },
      });

      const labelHeightIn = config.showLabel ? (config.labelFontSizePt / PT_PER_IN) * 1.6 : 0;
      const qrSizeIn = Math.min(config.stickerWidthIn, config.stickerHeightIn - labelHeightIn) - config.qrPaddingIn * 2;
      const qrX = x + (config.stickerWidthIn - qrSizeIn) / 2;
      const qrY = y + config.qrPaddingIn;

      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizeIn, qrSizeIn);

      if (config.showLabel && invite.label) {
        doc.setFontSize(config.labelFontSizePt);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const labelY = qrY + qrSizeIn + labelHeightIn * 0.4;
        doc.text(invite.label, x + config.stickerWidthIn / 2, labelY, { align: 'center', maxWidth: config.stickerWidthIn - 0.1 });
      }
    }
  }

  doc.save(`wedding-invite-stickers-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function StickerSheetDownload({ invites }: StickerSheetDownloadProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<StickerConfig>(DEFAULTS);
  const [generating, setGenerating] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);

  const set = <K extends keyof StickerConfig>(key: K, value: StickerConfig[K]) => {
    setConfig(c => ({ ...c, [key]: value }));
  };

  const applyPreset = (index: number) => {
    setPresetIndex(index);
    if (index < PRESETS.length - 1) {
      setConfig(c => ({ ...c, ...PRESETS[index].config }));
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateStickerPDF(invites, config, window.location.origin);
    } finally {
      setGenerating(false);
    }
  };

  const [pageWIn, pageHIn] = getPageDimsIn(config.pageSize, config.orientation);
  const fitsH = config.marginLeftIn + config.cols * config.stickerWidthIn + (config.cols - 1) * config.gutterHIn <= pageWIn;
  const fitsV = config.marginTopIn + config.rows * config.stickerHeightIn + (config.rows - 1) * config.gutterVIn <= pageHIn;
  const fits = fitsH && fitsV;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={invites.length === 0}>
          <Printer className="w-4 h-4 mr-2" />
          Print Stickers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download Sticker Sheet PDF</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground">
            Generates a print-ready PDF with {invites.length} QR code stickers across {Math.ceil(invites.length / (config.cols * config.rows))} page(s).
          </p>

          {/* Preset */}
          <div className="space-y-2">
            <Label>Sticker Sheet Preset</Label>
            <Select value={String(presetIndex)} onValueChange={v => applyPreset(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p, i) => (
                  <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select value={config.pageSize} onValueChange={v => set('pageSize', v as PageSize)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">US Letter (8.5"×11")</SelectItem>
                  <SelectItem value="a4">A4 (8.27"×11.69")</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Orientation</Label>
              <Select value={config.orientation} onValueChange={v => set('orientation', v as Orientation)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Columns</Label>
              <Input type="number" min={1} max={10} value={config.cols} onChange={e => set('cols', parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label>Rows</Label>
              <Input type="number" min={1} max={20} value={config.rows} onChange={e => set('rows', parseInt(e.target.value) || 1)} />
            </div>
          </div>

          {/* Sticker size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Sticker Width (in)</Label>
              <Input type="number" step={0.01} min={0.5} value={config.stickerWidthIn} onChange={e => set('stickerWidthIn', parseFloat(e.target.value) || 2)} />
            </div>
            <div className="space-y-2">
              <Label>Sticker Height (in)</Label>
              <Input type="number" step={0.01} min={0.5} value={config.stickerHeightIn} onChange={e => set('stickerHeightIn', parseFloat(e.target.value) || 2)} />
            </div>
          </div>

          {/* Margins */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Top Margin (in)</Label>
              <Input type="number" step={0.01} min={0} value={config.marginTopIn} onChange={e => set('marginTopIn', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Left Margin (in)</Label>
              <Input type="number" step={0.01} min={0} value={config.marginLeftIn} onChange={e => set('marginLeftIn', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Gutters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Horizontal Gap (in)</Label>
              <Input type="number" step={0.01} min={0} value={config.gutterHIn} onChange={e => set('gutterHIn', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Vertical Gap (in)</Label>
              <Input type="number" step={0.01} min={0} value={config.gutterVIn} onChange={e => set('gutterVIn', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Label */}
          <div className="flex items-center justify-between border border-border rounded-lg p-3">
            <div>
              <p className="text-sm font-medium">Show guest name label</p>
              <p className="text-xs text-muted-foreground">Printed below the QR code</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.showLabel}
              onClick={() => set('showLabel', !config.showLabel)}
              className={`relative w-10 h-6 rounded-full transition-colors ${config.showLabel ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.showLabel ? 'left-5' : 'left-1'}`} />
            </button>
          </div>

          {config.showLabel && (
            <div className="space-y-2">
              <Label>Label Font Size (pt)</Label>
              <Input type="number" min={5} max={14} value={config.labelFontSizePt} onChange={e => set('labelFontSizePt', parseInt(e.target.value) || 7)} />
            </div>
          )}

          {/* Warning */}
          {!fits && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              Warning: stickers overflow the page with these settings.
              {!fitsH && ' Reduce columns, sticker width, or left margin.'}
              {!fitsV && ' Reduce rows, sticker height, or top margin.'}
            </div>
          )}

          <Button className="w-full" onClick={handleGenerate} disabled={generating || !fits}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF ({invites.length} stickers, {Math.ceil(invites.length / (config.cols * config.rows))} page{Math.ceil(invites.length / (config.cols * config.rows)) !== 1 ? 's' : ''})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
