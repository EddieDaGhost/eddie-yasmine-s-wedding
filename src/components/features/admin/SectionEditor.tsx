import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertCircle, ChevronDown, ChevronRight, Image as ImageIcon, Type, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ImagePicker } from './ImagePicker';
import type { SectionConfig, FieldConfig } from '@/lib/admin/sectionConfig';

interface SectionEditorProps {
  section: SectionConfig;
  content: Record<string, string>;
  onChange: (key: string, value: string) => void;
  highlightedField?: string;
  onFieldFocus?: (key: string) => void;
}

/**
 * Editor for a single section's content fields.
 * Supports text, textarea, JSON, and image field types.
 */
export const SectionEditor = ({
  section,
  content,
  onChange,
  highlightedField,
  onFieldFocus,
}: SectionEditorProps) => {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-expand highlighted field
  useEffect(() => {
    if (highlightedField) {
      setExpandedFields(prev => new Set(prev).add(highlightedField));
    }
  }, [highlightedField]);

  const validateJson = (value: string): { isValid: boolean; error?: string } => {
    if (!value.trim()) return { isValid: true };
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return { isValid: true };
    }
    try {
      JSON.parse(value);
      return { isValid: true };
    } catch (e) {
      return { isValid: false, error: (e as Error).message };
    }
  };

  const handleChange = (key: string, value: string) => {
    onChange(key, value);
    
    // Validate JSON fields
    const field = section.fields.find(f => f.key === key);
    if (field?.type === 'json') {
      const validation = validateJson(value);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, [key]: validation.error || 'Invalid JSON' }));
      } else {
        setErrors(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    }
  };

  const formatJson = (key: string) => {
    const value = content[key];
    if (!value) return;
    try {
      const formatted = JSON.stringify(JSON.parse(value), null, 2);
      onChange(key, formatted);
    } catch {
      // Ignore format errors
    }
  };

  const toggleField = (key: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderField = (field: FieldConfig) => {
    const value = content[field.key] || '';
    const isExpanded = expandedFields.has(field.key);
    const isHighlighted = highlightedField === field.key;
    const error = errors[field.key];

    const getFieldIcon = () => {
      switch (field.type) {
        case 'image': return <ImageIcon className="w-4 h-4" />;
        case 'json': return <Code className="w-4 h-4" />;
        default: return <Type className="w-4 h-4" />;
      }
    };

    return (
      <motion.div
        key={field.key}
        initial={false}
        animate={{
          backgroundColor: isHighlighted ? 'hsl(var(--primary) / 0.05)' : 'transparent',
        }}
        className={cn(
          'rounded-lg border transition-colors',
          isHighlighted ? 'border-primary' : 'border-border',
          error && 'border-destructive'
        )}
      >
        <Collapsible open={isExpanded} onOpenChange={() => toggleField(field.key)}>
          <CollapsibleTrigger asChild>
            <button
              className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 rounded-t-lg transition-colors"
              onClick={() => onFieldFocus?.(field.key)}
            >
              <div className="flex items-center gap-2">
                {getFieldIcon()}
                <span className="font-medium text-sm">{field.label}</span>
                {error && <AlertCircle className="w-4 h-4 text-destructive" />}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="p-3 pt-0 space-y-2">
              {field.type === 'text' && (
                <Input
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="font-mono text-sm"
                />
              )}

              {field.type === 'textarea' && (
                <Textarea
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="font-mono text-sm min-h-[80px]"
                />
              )}

              {field.type === 'json' && (
                <div className="space-y-2">
                  <Textarea
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={cn(
                      'font-mono text-xs min-h-[150px]',
                      error && 'border-destructive'
                    )}
                    placeholder='{"key": "value"}'
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatJson(field.key)}
                    disabled={!!error}
                  >
                    Format JSON
                  </Button>
                </div>
              )}

              {field.type === 'image' && (
                <ImagePicker
                  value={value}
                  onChange={(url) => handleChange(field.key, url)}
                  onAltChange={(alt) => handleChange(`${field.key}_alt`, alt)}
                  alt={content[`${field.key}_alt`] || ''}
                />
              )}

              {field.type === 'array' && (
                <div className="space-y-2">
                  <Textarea
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={cn(
                      'font-mono text-xs min-h-[150px]',
                      error && 'border-destructive'
                    )}
                    placeholder='[{"item": "value"}]'
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatJson(field.key)}
                    disabled={!!error}
                  >
                    Format JSON
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>
    );
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="py-3 bg-primary/5">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          {section.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {section.fields.map(renderField)}
      </CardContent>
    </Card>
  );
};

export default SectionEditor;
