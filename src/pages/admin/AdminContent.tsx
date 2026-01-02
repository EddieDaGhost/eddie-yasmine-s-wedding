import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAllContent, useUpdateContent, useCreateContent, useDeleteContent } from '@/hooks/useContent';
import { AdminLayout } from '@/components/features/admin/AdminLayout';

const AdminContent = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const { data: contentItems, isLoading } = useAllContent();
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  const [editingItem, setEditingItem] = useState<{ key: string; value: string } | null>(null);
  const [newItem, setNewItem] = useState({ key: '', value: '' });
  const [showNewForm, setShowNewForm] = useState(false);

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = async (key: string, value: string) => {
    try {
      await updateContent.mutateAsync({ key, value });
      toast({ title: 'Content updated!' });
      setEditingItem(null);
    } catch (error) {
      toast({ title: 'Error updating content', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!newItem.key.trim()) return;
    try {
      await createContent.mutateAsync(newItem);
      toast({ title: 'Content created!' });
      setNewItem({ key: '', value: '' });
      setShowNewForm(false);
    } catch (error) {
      toast({ title: 'Error creating content', variant: 'destructive' });
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete content "${key}"?`)) return;
    try {
      await deleteContent.mutateAsync(key);
      toast({ title: 'Content deleted!' });
    } catch (error) {
      toast({ title: 'Error deleting content', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout onLogout={logout}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground mb-1">Content Editor</h1>
          <p className="text-muted-foreground">Manage website content dynamically</p>
        </div>
        <Button variant="romantic" onClick={() => setShowNewForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* New Content Form */}
      {showNewForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 mb-6"
        >
          <h3 className="font-serif text-lg mb-4">New Content Item</h3>
          <div className="space-y-4">
            <div>
              <Label>Key</Label>
              <Input
                placeholder="content_key"
                value={newItem.key}
                onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
              />
            </div>
            <div>
              <Label>Value</Label>
              <Textarea
                placeholder="Content value..."
                value={newItem.value}
                onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="romantic" onClick={handleCreate} disabled={createContent.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {contentItems?.map((item) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {item.key}
                  </span>
                </div>

                {editingItem?.key === item.key ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editingItem.value}
                      onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                      rows={6}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="romantic"
                        size="sm"
                        onClick={() => handleSave(item.key!, editingItem.value)}
                        disabled={updateContent.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {item.value || '(empty)'}
                  </p>
                )}
              </div>

              {editingItem?.key !== item.key && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem({ key: item.key!, value: item.value || '' })}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.key!)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

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
