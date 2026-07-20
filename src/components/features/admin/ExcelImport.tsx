import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, Check } from 'lucide-react';
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

interface GuestRow {
  label: string;
  maxGuests: number;
}

interface ExcelImportProps {
  onImport: (guests: GuestRow[]) => void;
  isImporting: boolean;
  progress: { total: number; done: number } | null;
}

function parseSheet(file: File): Promise<GuestRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) {
          reject(new Error('The spreadsheet appears to be empty.'));
          return;
        }

        // Detect name column: first column whose header contains "name" or "label" or "guest"
        const headers = Object.keys(rows[0]);
        const nameCol =
          headers.find(h => /name|label|guest/i.test(h)) || headers[0];
        const guestsCol =
          headers.find(h => /max|guest.?count|num|qty|count|people|party/i.test(h) && h !== nameCol);

        const parsed: GuestRow[] = rows
          .map(row => {
            const label = String(row[nameCol] ?? '').trim();
            const raw = guestsCol ? row[guestsCol] : undefined;
            const maxGuests = raw !== undefined && raw !== '' ? Math.max(1, Math.min(20, Number(raw))) : 2;
            return { label, maxGuests: isNaN(maxGuests) ? 2 : maxGuests };
          })
          .filter(r => r.label.length > 0);

        if (parsed.length === 0) {
          reject(new Error('No valid guest names found. Make sure the first column has guest names.'));
          return;
        }

        resolve(parsed);
      } catch {
        reject(new Error('Could not parse the file. Make sure it is a valid .xlsx or .xls file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function ExcelImport({ onImport, isImporting, progress }: ExcelImportProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<GuestRow[] | null>(null);
  const [defaultMax, setDefaultMax] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setPreview(null);
    setFileName(file.name);
    try {
      const rows = await parseSheet(file);
      setPreview(rows);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleImport = () => {
    if (!preview) return;
    const guests = preview.map(r => ({ ...r, maxGuests: r.maxGuests }));
    onImport(guests);
  };

  const handleClose = (open: boolean) => {
    if (!open && !isImporting) {
      setOpen(false);
      setPreview(null);
      setError(null);
      setFileName(null);
    } else {
      setOpen(open);
    }
  };

  const applyDefaultMax = () => {
    if (!preview) return;
    setPreview(preview.map(r => ({ ...r, maxGuests: defaultMax })));
  };

  const done = progress?.done === progress?.total && progress !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Guest List from Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!preview && !isImporting && (
            <>
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
              >
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Drop your Excel file here</p>
                <p className="text-xs text-muted-foreground">or click to browse (.xlsx, .xls)</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Expected columns:</p>
                <p>• <strong>Name / Label / Guest</strong> (required) — guest or family name</p>
                <p>• <strong>Max Guests / Count / Party</strong> (optional) — defaults to 2</p>
              </div>
              {error && (
                <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </>
          )}

          {preview && !isImporting && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-muted-foreground">{preview.length} guests found</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setPreview(null); setFileName(null); }}>
                  Change file
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Set all max guests to</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={defaultMax}
                    onChange={e => setDefaultMax(parseInt(e.target.value) || 2)}
                    className="h-8"
                  />
                </div>
                <Button variant="outline" size="sm" className="mt-5" onClick={applyDefaultMax}>
                  Apply to all
                </Button>
              </div>

              <div className="border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Guest Name</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Max Guests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-3 py-2">{row.label}</td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={row.maxGuests}
                            onChange={e => {
                              const updated = [...preview];
                              updated[i] = { ...updated[i], maxGuests: parseInt(e.target.value) || 2 };
                              setPreview(updated);
                            }}
                            className="h-7 w-16 text-right ml-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button className="w-full" onClick={handleImport}>
                Create {preview.length} Invites
              </Button>
            </>
          )}

          {isImporting && progress && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                {done ? (
                  <Check className="w-10 h-10 mx-auto mb-2 text-green-500" />
                ) : (
                  <Loader2 className="w-10 h-10 mx-auto mb-2 animate-spin text-primary" />
                )}
                <p className="font-medium">{done ? 'Import complete!' : 'Importing guests...'}</p>
                <p className="text-sm text-muted-foreground">{progress.done} of {progress.total}</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              {done && (
                <Button className="w-full" onClick={() => handleClose(false)}>
                  Done
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
