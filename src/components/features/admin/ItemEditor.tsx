import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ImagePicker } from './ImagePicker';
import type { RepeatableItemConfig, ItemFieldSchema } from '@/lib/admin/repeatableItems';
import {
  parseArrayContent,
  stringifyArrayContent,
  addItem,
  removeItem,
  duplicateItem,
  updateItem,
  validateItem,
} from '@/lib/admin/repeatableItems';

interface ItemEditorProps {
  config: RepeatableItemConfig;
  content: string;
  onChange: (value: string) => void;
  selectedItemIndex?: number;
  onSelectItem: (index: number | undefined) => void;
  onHighlightItem?: (index: number | undefined) => void;
}

/**
 * Editor for repeating items (arrays) with drag-and-drop reordering.
 * Used for FAQ items, wedding party members, gallery items, etc.
 */
export const ItemEditor = ({
  config,
  content,
  onChange,
  selectedItemIndex,
  onSelectItem,
  onHighlightItem,
}: ItemEditorProps) => {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  // Parse content into items
  useEffect(() => {
    const parsed = parseArrayContent(content) as Record<string, unknown>[];
    setItems(parsed);
  }, [content]);

  // Auto-expand selected item
  useEffect(() => {
    if (selectedItemIndex !== undefined) {
      setExpandedItems(prev => new Set(prev).add(selectedItemIndex));
    }
  }, [selectedItemIndex]);

  // Update content when items change
  const updateContent = (newItems: Record<string, unknown>[]) => {
    setItems(newItems);
    onChange(stringifyArrayContent(newItems));
  };

  // Handle item field change
  const handleFieldChange = (index: number, key: string, value: unknown) => {
    const newItems = updateItem(items, index, { [key]: value }) as Record<string, unknown>[];
    updateContent(newItems);

    // Validate the item
    const validation = validateItem(newItems[index] as Record<string, unknown>, config.fields);
    setErrors(prev => ({
      ...prev,
      [index]: validation.errors,
    }));
  };

  // Add new item
  const handleAddItem = (position?: number) => {
    const newItems = addItem(items, { ...config.defaultItem }, position) as Record<string, unknown>[];
    updateContent(newItems);
    const newIndex = position ?? newItems.length - 1;
    onSelectItem(newIndex);
    setExpandedItems(prev => new Set(prev).add(newIndex));
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    const newItems = removeItem(items, index) as Record<string, unknown>[];
    updateContent(newItems);
    if (selectedItemIndex === index) {
      onSelectItem(undefined);
    } else if (selectedItemIndex !== undefined && selectedItemIndex > index) {
      onSelectItem(selectedItemIndex - 1);
    }
  };

  // Duplicate item
  const handleDuplicateItem = (index: number) => {
    const newItems = duplicateItem(items, index) as Record<string, unknown>[];
    updateContent(newItems);
    onSelectItem(index + 1);
    setExpandedItems(prev => new Set(prev).add(index + 1));
  };

  // Reorder items via drag and drop
  const handleReorder = (newItems: Record<string, unknown>[]) => {
    updateContent(newItems);
    // Update selected index if needed
    if (selectedItemIndex !== undefined && items[selectedItemIndex]) {
      const selectedItem = items[selectedItemIndex];
      const newIndex = newItems.findIndex(item => item === selectedItem);
      if (newIndex !== -1 && newIndex !== selectedItemIndex) {
        onSelectItem(newIndex);
      }
    }
  };

  // Toggle item expansion
  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Render a single field
  const renderField = (field: ItemFieldSchema, item: Record<string, unknown>, index: number) => {
    const value = item[field.key] as string || '';
    const error = errors[index]?.[field.key];

    return (
      <div key={field.key} className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>

        {field.type === 'text' && (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
            placeholder={field.placeholder}
            className={cn('text-sm', error && 'border-destructive')}
          />
        )}

        {field.type === 'textarea' && (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
            placeholder={field.placeholder}
            className={cn('text-sm min-h-[60px]', error && 'border-destructive')}
          />
        )}

        {field.type === 'image' && (
          <ImagePicker
            value={value}
            onChange={(url) => handleFieldChange(index, field.key, url)}
            onAltChange={(alt) => handleFieldChange(index, `${field.key}_alt`, alt)}
            alt={item[`${field.key}_alt`] as string || ''}
          />
        )}

        {field.type === 'date' && (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
            className={cn('text-sm', error && 'border-destructive')}
          />
        )}

        {field.type === 'select' && field.options && (
          <select
            value={value}
            onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              error && 'border-destructive'
            )}
          >
            <option value="">Select...</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {field.type === 'boolean' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(item[field.key])}
              onChange={(e) => handleFieldChange(index, field.key, e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm text-muted-foreground">{field.placeholder || 'Enabled'}</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  // Get preview text for collapsed items
  const getItemPreview = (item: Record<string, unknown>): string => {
    const nameFields = ['name', 'title', 'question', 'label'];
    for (const field of nameFields) {
      if (item[field] && typeof item[field] === 'string') {
        const text = item[field] as string;
        return text.length > 40 ? text.substring(0, 40) + '...' : text;
      }
    }
    return `${config.singularLabel} ${items.indexOf(item) + 1}`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{config.label}</span>
          <Badge variant="secondary" className="text-xs">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddItem()}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add {config.singularLabel}
        </Button>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const isExpanded = expandedItems.has(index);
              const isSelected = selectedItemIndex === index;
              const hasErrors = errors[index] && Object.keys(errors[index]).length > 0;

              return (
                <Reorder.Item
                  key={`item-${index}-${JSON.stringify(item).substring(0, 50)}`}
                  value={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onMouseEnter={() => onHighlightItem?.(index)}
                  onMouseLeave={() => onHighlightItem?.(undefined)}
                >
                  <Card
                    className={cn(
                      'transition-all duration-150',
                      isSelected && 'ring-2 ring-primary shadow-md',
                      hasErrors && 'border-destructive/50'
                    )}
                  >
                    {/* Item Header */}
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors',
                        'hover:bg-muted/50',
                        isExpanded && 'border-b border-border'
                      )}
                      onClick={() => {
                        onSelectItem(index);
                        toggleExpanded(index);
                      }}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">#{index + 1}</span>
                          <span className="text-sm font-medium truncate">
                            {getItemPreview(item)}
                          </span>
                          {hasErrors && (
                            <AlertCircle className="w-3 h-3 text-destructive" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateItem(index);
                          }}
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {config.singularLabel}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this item.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveItem(index)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Item Fields */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="px-3 py-3 space-y-3">
                            {config.fields.map(field => renderField(field, item, index))}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No {config.label.toLowerCase()} yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddItem()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First {config.singularLabel}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ItemEditor;
