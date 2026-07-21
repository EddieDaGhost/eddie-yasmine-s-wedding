import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { FadeIn } from '@/components/animation/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer';
import { useAllContent } from '@/hooks/useContent';
import { Download, Palette, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DressCode = () => {
  const { data } = useAllContent();

  const title = data?.find(c => c.key === 'dresscode_title')?.value || 'Dress Code';
  const subtitle = data?.find(c => c.key === 'dresscode_subtitle')?.value ||
    'We want you to look and feel your best. Here\'s everything you need to know.';
  const description = data?.find(c => c.key === 'dresscode_description')?.value ||
    'Our wedding calls for semi-formal attire. Think cocktail dresses, elegant jumpsuits, suits, or dressy separates. Please keep in mind that portions of the venue are outdoors on grass — plan your footwear accordingly!';
  const pdfUrl = data?.find(c => c.key === 'dresscode_pdf_url')?.value || '';

  // Colors stored as JSON: [{ name, hex, note }]
  const colorsJson = data?.find(c => c.key === 'dresscode_colors')?.value;
  let colors: { name: string; hex: string; note?: string }[] = [];
  try {
    colors = colorsJson ? JSON.parse(colorsJson) : [];
  } catch {}

  if (colors.length === 0) {
    colors = [
      { name: 'Sage', hex: '#8FAF8A', note: 'Encouraged' },
      { name: 'Dusty Rose', hex: '#C9A09A', note: 'Encouraged' },
      { name: 'Champagne', hex: '#E8D5B0', note: 'Encouraged' },
      { name: 'Ivory / Cream', hex: '#F5F0E8', note: 'Avoid — reserved for the bride' },
      { name: 'White', hex: '#FFFFFF', note: 'Avoid — reserved for the bride' },
    ];
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-32 romantic-gradient">
        <div className="container mx-auto px-4">
          <SectionHeader title={title} subtitle={subtitle} ornament />
        </div>
      </section>

      {/* Description */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">Semi-Formal</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                {description}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Color Palette */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h3 className="font-display text-2xl md:text-3xl text-center text-foreground mb-3">
              Color Palette
            </h3>
            <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
              Our wedding palette is soft and romantic. We'd love for guests to complement the aesthetic — but most importantly, wear what makes you feel wonderful.
            </p>
          </FadeIn>

          <StaggerContainer className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {colors.map((color) => {
              const isAvoid = color.note?.toLowerCase().includes('avoid');
              return (
                <StaggerItem key={color.name}>
                  <div className="flex flex-col items-center gap-3 group">
                    <div
                      className="w-24 h-24 rounded-full shadow-md border-4 border-white/50 transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-center">
                      <p className="font-serif text-base text-foreground">{color.name}</p>
                      {color.note && (
                        <p className={`text-xs mt-0.5 font-medium ${isAvoid ? 'text-destructive/70' : 'text-primary/70'}`}>
                          {color.note}
                        </p>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* PDF Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-3xl mx-auto">
              {pdfUrl ? (
                <div className="space-y-6">
                  <h3 className="font-display text-2xl text-center text-foreground mb-6">
                    Dress Code Guide
                  </h3>
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[70vh] border-0"
                      title="Dress Code Guide"
                    />
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button variant="romantic" asChild>
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={pdfUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Palette className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <p className="font-display text-xl text-foreground mb-2">Lookbook Coming Soon</p>
                  <p className="text-muted-foreground text-sm">
                    We're putting together a visual guide to help you plan your look. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
    </Layout>
  );
};

export default DressCode;
