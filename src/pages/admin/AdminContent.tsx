import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAllContent, useUpdateContent, useCreateContent, useDeleteContent } from '@/hooks/useContent';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ContentItem {
  id: number;
  key: string | null;
  value: string | null;
  created_at: string;
}

interface LocalEdit {
  value: string;
  isValid: boolean;
  errorMessage?: string;
}

// Helper to detect if content is JSON
const isJsonContent = (value: string | null): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
};

// Validate JSON
const validateJson = (value: string): { isValid: boolean; errorMessage?: string } => {
  if (!isJsonContent(value)) {
    return { isValid: true };
  }
  try {
    JSON.parse(value);
    return { isValid: true };
  } catch (e) {
    return { 
      isValid: false, 
      errorMessage: `Invalid JSON: ${(e as Error).message}` 
    };
  }
};

// Format JSON for display
const formatJson = (value: string): string => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

// Auto-resizing textarea hook
const useAutoResize = (value: string) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
    }
  }, [value]);

  return textareaRef;
};

// Content categories for organization
const getContentCategory = (key: string | null): string => {
  if (!key) return 'Other';
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('bridesmaid') || lowerKey.includes('groomsmen') || lowerKey.includes('wedding_party')) {
    return 'Wedding Party';
  }
  if (lowerKey.includes('faq')) return 'FAQ';
  if (lowerKey.includes('travel')) return 'Travel';
  if (lowerKey.includes('registry')) return 'Registry';
  if (lowerKey.includes('timeline') || lowerKey.includes('event')) return 'Timeline & Events';
  if (lowerKey.includes('story')) return 'Our Story';
  return 'General';
};

// Collapsible content card component
const ContentCard = ({
  item,
  localValue,
  isExpanded,
  onToggle,
  onChange,
  onSave,
  onDelete,
  isSaving,
  hasChanges,
}: {
  item: ContentItem;
  localValue: LocalEdit;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}) => {
  const textareaRef = useAutoResize(localValue.value);
  const isJson = isJsonContent(localValue.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {item.key}
              </span>
              {isJson && (
                <Badge variant="outline" className="text-xs">JSON</Badge>
              )}
              {hasChanges && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Unsaved
                </Badge>
              )}
              {!localValue.isValid && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Invalid
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4 border-t border-border/50">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={localValue.value}
                onChange={(e) => onChange(e.target.value)}
                className={`min-h-[120px] max-h-[500px] font-mono text-sm resize-none ${
                  !localValue.isValid ? 'border-destructive focus:ring-destructive' : ''
                }`}
                placeholder="Enter content value..."
              />
              {!localValue.isValid && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {localValue.errorMessage}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="romantic"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving || !localValue.isValid || !hasChanges}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </Button>
                {isJson && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange(formatJson(localValue.value))}
                    disabled={!localValue.isValid}
                  >
                    Format JSON
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

const AdminContent = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const { data: contentItems, isLoading, refetch } = useAllContent();
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  // Local state for editing
  const [localEdits, setLocalEdits] = useState<Record<string, LocalEdit>>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newItem, setNewItem] = useState({ key: '', value: '' });
  const [showNewForm, setShowNewForm] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Initialize local edits when content loads
  useEffect(() => {
    if (contentItems) {
      const initialEdits: Record<string, LocalEdit> = {};
      contentItems.forEach((item) => {
        if (item.key && !localEdits[item.key]) {
          const validation = validateJson(item.value || '');
          initialEdits[item.key] = {
            value: item.value || '',
            isValid: validation.isValid,
            errorMessage: validation.errorMessage,
          };
        }
      });
      if (Object.keys(initialEdits).length > 0) {
        setLocalEdits((prev) => ({ ...prev, ...initialEdits }));
      }
    }
  }, [contentItems]);

  // Check if there are any unsaved changes
  const hasAnyChanges = useCallback(() => {
    if (!contentItems) return false;
    return contentItems.some((item) => {
      const localEdit = localEdits[item.key!];
      return localEdit && localEdit.value !== (item.value || '');
    });
  }, [contentItems, localEdits]);

  // Handle local edit change
  const handleLocalChange = (key: string, value: string) => {
    const validation = validateJson(value);
    setLocalEdits((prev) => ({
      ...prev,
      [key]: {
        value,
        isValid: validation.isValid,
        errorMessage: validation.errorMessage,
      },
    }));
  };

  // Toggle expanded state
  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Save single item with optimistic update
  const handleSave = async (key: string) => {
    const localEdit = localEdits[key];
    if (!localEdit || !localEdit.isValid) return;

    // Optimistic update happens via React Query's mutation
    try {
      await updateContent.mutateAsync({ key, value: localEdit.value });
      toast({
        title: 'Content saved!',
        description: `"${key}" has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error saving content',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (!contentItems) return;

    const changedItems = contentItems.filter((item) => {
      const localEdit = localEdits[item.key!];
      return localEdit && localEdit.value !== (item.value || '') && localEdit.isValid;
    });

    if (changedItems.length === 0) {
      toast({
        title: 'No changes to save',
        description: 'All content is up to date.',
      });
      return;
    }

    setIsSavingAll(true);

    try {
      await Promise.all(
        changedItems.map((item) =>
          updateContent.mutateAsync({
            key: item.key!,
            value: localEdits[item.key!].value,
          })
        )
      );

      toast({
        title: 'All changes saved!',
        description: `${changedItems.length} item(s) updated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error saving some changes',
        description: 'Please check individual items and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  // Revert all changes
  const handleRevertAll = () => {
    if (!contentItems) return;

    const revertedEdits: Record<string, LocalEdit> = {};
    contentItems.forEach((item) => {
      if (item.key) {
        const validation = validateJson(item.value || '');
        revertedEdits[item.key] = {
          value: item.value || '',
          isValid: validation.isValid,
          errorMessage: validation.errorMessage,
        };
      }
    });
    setLocalEdits(revertedEdits);
    refetch();

    toast({
      title: 'Changes reverted',
      description: 'All content has been reset to saved values.',
    });
  };

  // Create new item
  const handleCreate = async () => {
    if (!newItem.key.trim()) {
      toast({
        title: 'Key required',
        description: 'Please enter a content key.',
        variant: 'destructive',
      });
      return;
    }

    const validation = validateJson(newItem.value);
    if (!validation.isValid) {
      toast({
        title: 'Invalid JSON',
        description: validation.errorMessage,
        variant: 'destructive',
      });
      return;
    }

    try {
      await createContent.mutateAsync(newItem);
      toast({
        title: 'Content created!',
        description: `"${newItem.key}" has been added.`,
      });
      setNewItem({ key: '', value: '' });
      setShowNewForm(false);
    } catch (error) {
      toast({
        title: 'Error creating content',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete item
  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteContent.mutateAsync(key);
      toast({
        title: 'Content deleted',
        description: `"${key}" has been removed.`,
      });
      // Remove from local edits
      setLocalEdits((prev) => {
        const newEdits = { ...prev };
        delete newEdits[key];
        return newEdits;
      });
    } catch (error) {
      toast({
        title: 'Error deleting content',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Group content by category
  const groupedContent = contentItems?.reduce((acc, item) => {
    const category = getContentCategory(item.key);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const categoryOrder = ['Wedding Party', 'Timeline & Events', 'Our Story', 'FAQ', 'Travel', 'Registry', 'General', 'Other'];

  return (
    <AdminLayout onLogout={logout}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Content Editor</h1>
          <p className="text-muted-foreground">
            Manage website content dynamically • {contentItems?.length || 0} items
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRevertAll}
            disabled={!hasAnyChanges()}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Revert All
          </Button>
          <Button
            variant="romantic"
            onClick={handleSaveAll}
            disabled={!hasAnyChanges() || isSavingAll}
          >
            {isSavingAll ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
          <Button variant="default" onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasAnyChanges() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800 dark:text-amber-200 text-sm">
            You have unsaved changes. Don't forget to save before leaving.
          </span>
        </motion.div>
      )}

      {/* New Content Form */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-serif text-lg mb-4">New Content Item</h3>
              <div className="space-y-4">
                <div>
                  <Label>Key (e.g., "wedding_party_bridesmaids")</Label>
                  <Input
                    placeholder="content_key"
                    value={newItem.key}
                    onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label>Value (plain text or JSON)</Label>
                  <Textarea
                    placeholder="Content value or JSON array/object..."
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                    rows={6}
                    className="font-mono"
                  />
                  {isJsonContent(newItem.value) && !validateJson(newItem.value).isValid && (
                    <p className="text-destructive text-xs mt-1">
                      {validateJson(newItem.value).errorMessage}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="romantic"
                    onClick={handleCreate}
                    disabled={createContent.isPending}
                  >
                    {createContent.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content List by Category */}
      <div className="space-y-8">
        {groupedContent && categoryOrder.map((category) => {
          const items = groupedContent[category];
          if (!items || items.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                {category}
                <Badge variant="outline" className="text-xs font-normal">
                  {items.length}
                </Badge>
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const localEdit = localEdits[item.key!] || {
                    value: item.value || '',
                    isValid: true,
                  };
                  const hasChanges = localEdit.value !== (item.value || '');

                  return (
                    <ContentCard
                      key={item.key}
                      item={item}
                      localValue={localEdit}
                      isExpanded={expandedItems.has(item.key!)}
                      onToggle={() => toggleExpanded(item.key!)}
                      onChange={(value) => handleLocalChange(item.key!, value)}
                      onSave={() => handleSave(item.key!)}
                      onDelete={() => handleDelete(item.key!)}
                      isSaving={updateContent.isPending}
                      hasChanges={hasChanges}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {contentItems?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No content items yet. Add your first one above.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContent;