import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Eye,
  Undo2,
  Redo2,
  Smartphone,
  Tablet,
  Monitor,
  ChevronLeft,
  ChevronRight,
  History,
  Send,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PanelRightOpen,
  PanelRightClose,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { useAllContent, useUpdateContent } from '@/hooks/useContent';
import { usePageDrafts, useLatestDraft, useCreateDraft, usePublishDraft, useRestoreVersion } from '@/hooks/usePageDrafts';

// Available pages for visual editing
const EDITABLE_PAGES = [
  { key: 'home', label: 'Home', path: '/', contentKeys: ['home_title', 'home_subtitle', 'wedding_date', 'venue_name', 'venue_address'] },
  { key: 'our-story', label: 'Our Story', path: '/our-story', contentKeys: ['story_title', 'story_subtitle', 'story_quote'] },
  { key: 'wedding-party', label: 'Wedding Party', path: '/wedding-party', contentKeys: ['party_title', 'party_subtitle', 'bridesmaids_data', 'groomsmen_data'] },
  { key: 'faq', label: 'FAQ', path: '/faq', contentKeys: ['faq_title', 'faq_subtitle', 'faq_items'] },
  { key: 'registry', label: 'Registry', path: '/registry', contentKeys: ['registry_title', 'registry_subtitle', 'registry_message', 'registry_items'] },
  { key: 'travel', label: 'Travel', path: '/travel', contentKeys: ['travel_title', 'travel_subtitle', 'travel_hotels', 'travel_tips'] },
];

type DeviceView = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<DeviceView, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

interface ContentEdit {
  key: string;
  value: string;
  isValid: boolean;
  errorMessage?: string;
}

const validateJson = (value: string): { isValid: boolean; errorMessage?: string } => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return { isValid: true };
  }
  try {
    JSON.parse(value);
    return { isValid: true };
  } catch (e) {
    return { isValid: false, errorMessage: `Invalid JSON: ${(e as Error).message}` };
  }
};

const formatJson = (value: string): string => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const AdminVisualEditor = () => {
  const { isAuthenticated, logout, session } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // State
  const [selectedPage, setSelectedPage] = useState(searchParams.get('page') || 'home');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [localEdits, setLocalEdits] = useState<Record<string, ContentEdit>>({});
  const [activeTab, setActiveTab] = useState<'content' | 'versions'>('content');
  const [isSaving, setIsSaving] = useState(false);

  // Data hooks
  const { data: allContent, isLoading: isLoadingContent } = useAllContent();
  const { data: drafts, isLoading: isLoadingDrafts } = usePageDrafts(selectedPage);
  const { data: latestDraft } = useLatestDraft(selectedPage);
  const updateContent = useUpdateContent();
  const createDraft = useCreateDraft();
  const publishDraft = usePublishDraft();
  const restoreVersion = useRestoreVersion();

  // Get current page config
  const currentPage = EDITABLE_PAGES.find(p => p.key === selectedPage) || EDITABLE_PAGES[0];

  // Initialize local edits from content
  useEffect(() => {
    if (allContent && currentPage) {
      const edits: Record<string, ContentEdit> = {};
      currentPage.contentKeys.forEach(key => {
        const content = allContent.find(c => c.key === key);
        const value = content?.value || '';
        const validation = validateJson(value);
        edits[key] = { key, value, ...validation };
      });
      setLocalEdits(edits);
    }
  }, [allContent, currentPage]);

  // Update URL when page changes
  useEffect(() => {
    setSearchParams({ page: selectedPage });
  }, [selectedPage, setSearchParams]);

  // Handle local edit change
  const handleEditChange = (key: string, value: string) => {
    const validation = validateJson(value);
    setLocalEdits(prev => ({
      ...prev,
      [key]: { key, value, ...validation },
    }));
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (!allContent) return false;
    return Object.values(localEdits).some(edit => {
      const original = allContent.find(c => c.key === edit.key);
      return edit.value !== (original?.value || '');
    });
  }, [allContent, localEdits]);

  // Check if all edits are valid
  const allEditsValid = useCallback(() => {
    return Object.values(localEdits).every(edit => edit.isValid);
  }, [localEdits]);

  // Save as draft
  const handleSaveDraft = async () => {
    if (!allEditsValid()) {
      toast({
        title: 'Invalid content',
        description: 'Please fix JSON errors before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Build content object
      const content: Record<string, unknown> = {};
      Object.values(localEdits).forEach(edit => {
        content[edit.key] = edit.value;
      });

      await createDraft.mutateAsync({
        pageKey: selectedPage,
        content,
        notes: 'Draft saved from visual editor',
        createdBy: session?.user?.email || undefined,
      });

      toast({
        title: 'Draft saved!',
        description: `Version ${(latestDraft?.version || 0) + 1} created.`,
      });
    } catch (error) {
      toast({
        title: 'Error saving draft',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish changes (save draft then publish)
  const handlePublish = async () => {
    if (!allEditsValid()) {
      toast({
        title: 'Invalid content',
        description: 'Please fix JSON errors before publishing.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // First save as draft
      const content: Record<string, unknown> = {};
      Object.values(localEdits).forEach(edit => {
        content[edit.key] = edit.value;
      });

      const newDraft = await createDraft.mutateAsync({
        pageKey: selectedPage,
        content,
        notes: 'Published from visual editor',
        createdBy: session?.user?.email || undefined,
      });

      // Then publish
      await publishDraft.mutateAsync({
        draftId: newDraft.id,
        pageKey: selectedPage,
      });

      toast({
        title: 'Published!',
        description: 'Changes are now live on the website.',
      });

      // Refresh iframe
      refreshPreview();
    } catch (error) {
      toast({
        title: 'Error publishing',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Restore a previous version
  const handleRestore = async (draftId: string, version: number) => {
    try {
      const restored = await restoreVersion.mutateAsync({
        draftId,
        pageKey: selectedPage,
        createdBy: session?.user?.email || undefined,
      });

      // Update local edits with restored content
      const content = restored.content as Record<string, string>;
      const edits: Record<string, ContentEdit> = {};
      Object.entries(content).forEach(([key, value]) => {
        const validation = validateJson(value);
        edits[key] = { key, value, ...validation };
      });
      setLocalEdits(edits);

      toast({
        title: 'Version restored!',
        description: `Content restored from version ${version}.`,
      });
    } catch (error) {
      toast({
        title: 'Error restoring version',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Refresh preview iframe
  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Revert to saved
  const handleRevert = () => {
    if (allContent && currentPage) {
      const edits: Record<string, ContentEdit> = {};
      currentPage.contentKeys.forEach(key => {
        const content = allContent.find(c => c.key === key);
        const value = content?.value || '';
        const validation = validateJson(value);
        edits[key] = { key, value, ...validation };
      });
      setLocalEdits(edits);
      toast({
        title: 'Changes reverted',
        description: 'Content reset to last published version.',
      });
    }
  };

  if (isAuthenticated === null || isLoadingContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout onLogout={logout}>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            {/* Page Selector */}
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              {EDITABLE_PAGES.map(page => (
                <option key={page.key} value={page.key}>{page.label}</option>
              ))}
            </select>

            {/* Status Badges */}
            {hasUnsavedChanges() && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Unsaved Changes
              </Badge>
            )}
            {latestDraft && !latestDraft.is_published && (
              <Badge variant="outline">
                Draft v{latestDraft.version}
              </Badge>
            )}
          </div>

          {/* Device Toggles */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={deviceView === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceView === 'tablet' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceView === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refreshPreview}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRevert} disabled={!hasUnsavedChanges()}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving || !hasUnsavedChanges() || !allEditsValid()}
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button
              variant="romantic"
              size="sm"
              onClick={handlePublish}
              disabled={isSaving || !allEditsValid()}
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Publish
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidePanel(!showSidePanel)}
            >
              {showSidePanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 bg-muted/30 p-4 overflow-auto flex items-start justify-center">
            <motion.div
              layout
              className="bg-background rounded-lg shadow-lg overflow-hidden"
              style={{
                width: deviceWidths[deviceView],
                maxWidth: '100%',
                height: deviceView === 'mobile' ? '667px' : deviceView === 'tablet' ? '1024px' : '100%',
              }}
            >
              <iframe
                ref={iframeRef}
                src={`${currentPage.path}?adminPreview=true`}
                className="w-full h-full border-0"
                title="Page Preview"
              />
            </motion.div>
          </div>

          {/* Side Panel */}
          <AnimatePresence>
            {showSidePanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-border bg-card overflow-hidden"
              >
                <div className="w-[400px] h-full flex flex-col">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'content' | 'versions')} className="flex-1 flex flex-col">
                    <TabsList className="w-full justify-start rounded-none border-b border-border">
                      <TabsTrigger value="content" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="versions" className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Versions
                      </TabsTrigger>
                    </TabsList>

                    {/* Content Tab */}
                    <TabsContent value="content" className="flex-1 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Edit content for <strong>{currentPage.label}</strong> page. Click on content blocks to edit.
                          </p>

                          {Object.values(localEdits).map(edit => (
                            <Card key={edit.key} className={!edit.isValid ? 'border-destructive' : ''}>
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm font-mono flex items-center gap-2">
                                  {edit.key}
                                  {!edit.isValid && (
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                  )}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-0 pb-4">
                                <Textarea
                                  value={edit.value}
                                  onChange={(e) => handleEditChange(edit.key, e.target.value)}
                                  className="font-mono text-xs min-h-[100px] resize-y"
                                  placeholder="Enter content..."
                                />
                                {!edit.isValid && (
                                  <p className="text-destructive text-xs mt-1">{edit.errorMessage}</p>
                                )}
                                {edit.value.trim().startsWith('{') || edit.value.trim().startsWith('[') ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleEditChange(edit.key, formatJson(edit.value))}
                                    disabled={!edit.isValid}
                                  >
                                    Format JSON
                                  </Button>
                                ) : null}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Versions Tab */}
                    <TabsContent value="versions" className="flex-1 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Version history for <strong>{currentPage.label}</strong>
                          </p>

                          {isLoadingDrafts ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : drafts && drafts.length > 0 ? (
                            drafts.map(draft => (
                              <Card key={draft.id} className={draft.is_published ? 'border-primary' : ''}>
                                <CardContent className="py-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Version {draft.version}</span>
                                        {draft.is_published && (
                                          <Badge variant="default" className="text-xs">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Published
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(draft.created_at).toLocaleString()}
                                      </p>
                                      {draft.notes && (
                                        <p className="text-xs text-muted-foreground">{draft.notes}</p>
                                      )}
                                      {draft.created_by && (
                                        <p className="text-xs text-muted-foreground">By: {draft.created_by}</p>
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRestore(draft.id, draft.version)}
                                      disabled={restoreVersion.isPending}
                                    >
                                      Restore
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              No versions yet. Save a draft to create the first version.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVisualEditor;
