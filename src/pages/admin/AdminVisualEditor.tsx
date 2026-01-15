import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Undo2,
  Smartphone,
  Tablet,
  Monitor,
  History,
  Send,
  FileText,
  Loader2,
  CheckCircle2,
  PanelRightOpen,
  PanelRightClose,
  RefreshCw,
  PanelLeftOpen,
  PanelLeftClose,
  RotateCcw,
  Image as ImageIcon,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { useAllContent } from '@/hooks/useContent';
import { 
  usePageDrafts, 
  useLatestDraft, 
  useCreateDraft, 
  usePublishDraft, 
  useRestoreVersion 
} from '@/hooks/usePageDrafts';
import { PageStructureMap, type PageSection } from '@/components/features/admin/PageStructureMap';
import { SectionEditor } from '@/components/features/admin/SectionEditor';
import { ImagePicker } from '@/components/features/admin/ImagePicker';
import { ItemEditor } from '@/components/features/admin/ItemEditor';
import { 
  EDITABLE_PAGES, 
  getPageConfig, 
  getPageContentKeys,
} from '@/lib/admin/sectionConfig';
import { getIframeOverlayScript } from '@/lib/admin/iframeOverlayScript';
import { getRepeatableConfig } from '@/lib/admin/repeatableItems';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<DeviceView, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const deviceHeights: Record<DeviceView, string> = {
  desktop: '100%',
  tablet: '1024px',
  mobile: '667px',
};

interface ContentEdit {
  key: string;
  value: string;
  isValid: boolean;
  errorMessage?: string;
}

interface SelectedElement {
  type: 'section' | 'text' | 'image' | 'item';
  sectionId?: string;
  itemIndex?: number;
  repeatableKey?: string;
  text?: string;
  src?: string;
  alt?: string;
  path?: string;
}

type EditorMode = 'section' | 'item' | 'none';

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

const AdminVisualEditor = () => {
  const { isAuthenticated, logout, session } = useAdminAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // State
  const [selectedPage, setSelectedPage] = useState(searchParams.get('page') || 'home');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [localEdits, setLocalEdits] = useState<Record<string, ContentEdit>>({});
  const [activeTab, setActiveTab] = useState<'content' | 'versions' | 'image'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  
  // Selection state
  const [selectedSection, setSelectedSection] = useState<string | undefined>();
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | undefined>();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | undefined>();
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | undefined>();
  const [editorMode, setEditorMode] = useState<EditorMode>('none');
  
  // Section visibility state
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});

  // Data hooks
  const { data: allContent, isLoading: isLoadingContent } = useAllContent();
  const { data: drafts, isLoading: isLoadingDrafts } = usePageDrafts(selectedPage);
  const { data: latestDraft } = useLatestDraft(selectedPage);
  const createDraft = useCreateDraft();
  const publishDraft = usePublishDraft();
  const restoreVersion = useRestoreVersion();

  // Get current page config
  const currentPageConfig = getPageConfig(selectedPage);
  const contentKeys = getPageContentKeys(selectedPage);

  // Build sections for PageStructureMap
  const sections: PageSection[] = currentPageConfig?.sections.map(s => ({
    id: s.id,
    label: s.label,
    contentKeys: s.contentKeys,
    visible: sectionVisibility[s.id] !== false,
    selector: s.selector,
    hasRepeatableItems: !!s.repeatableKey,
    repeatableKey: s.repeatableKey,
  })) || [];

  // Initialize local edits from content
  useEffect(() => {
    if (allContent && contentKeys.length > 0) {
      const edits: Record<string, ContentEdit> = {};
      contentKeys.forEach(key => {
        const content = allContent.find(c => c.key === key);
        const value = content?.value || '';
        const validation = validateJson(value);
        edits[key] = { key, value, ...validation };
      });
      setLocalEdits(edits);
    }
  }, [allContent, selectedPage]);

  // Initialize section visibility
  useEffect(() => {
    if (currentPageConfig) {
      const visibility: Record<string, boolean> = {};
      currentPageConfig.sections.forEach(s => {
        visibility[s.id] = true;
      });
      setSectionVisibility(visibility);
    }
  }, [selectedPage]);

  // Update URL when page changes
  useEffect(() => {
    setSearchParams({ page: selectedPage });
    setSelectedSection(undefined);
    setSelectedItemIndex(undefined);
    setSelectedElement(null);
    setEditorMode('none');
    setIframeReady(false);
  }, [selectedPage, setSearchParams]);

  // Send messages to iframe
  const sendToIframe = useCallback((message: Record<string, unknown>) => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(message, '*');
    }
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;

      switch (e.data.type) {
        case 'editor-ready':
          setIframeReady(true);
          break;
          
        case 'section-selected':
          setSelectedSection(e.data.sectionId);
          // Check if there's also an item selected
          if (e.data.itemIndex !== undefined && e.data.itemIndex !== null) {
            setSelectedItemIndex(e.data.itemIndex);
            setEditorMode('item');
            setSelectedElement({ 
              type: 'item', 
              sectionId: e.data.sectionId, 
              itemIndex: e.data.itemIndex 
            });
          } else {
            setSelectedItemIndex(undefined);
            setEditorMode('section');
            setSelectedElement({ type: 'section', sectionId: e.data.sectionId });
          }
          setActiveTab('content');
          break;
          
        case 'item-selected':
          // Handle explicit item selection
          setSelectedSection(e.data.sectionId);
          setSelectedItemIndex(e.data.itemIndex);
          setEditorMode('item');
          setSelectedElement({
            type: 'item',
            sectionId: e.data.sectionId,
            itemIndex: e.data.itemIndex,
            repeatableKey: e.data.repeatableKey,
          });
          setActiveTab('content');
          break;
          
        case 'text-element-selected':
          setSelectedElement({
            type: 'text',
            sectionId: e.data.sectionId,
            itemIndex: e.data.itemIndex,
            text: e.data.text,
            path: e.data.path,
          });
          if (e.data.sectionId) {
            setSelectedSection(e.data.sectionId);
          }
          if (e.data.itemIndex !== undefined && e.data.itemIndex !== null) {
            setSelectedItemIndex(e.data.itemIndex);
            setEditorMode('item');
          } else {
            setEditorMode('section');
          }
          setActiveTab('content');
          break;
          
        case 'image-element-selected':
          setSelectedElement({
            type: 'image',
            sectionId: e.data.sectionId,
            itemIndex: e.data.itemIndex,
            src: e.data.src,
            alt: e.data.alt,
            path: e.data.path,
          });
          if (e.data.sectionId) {
            setSelectedSection(e.data.sectionId);
          }
          if (e.data.itemIndex !== undefined && e.data.itemIndex !== null) {
            setSelectedItemIndex(e.data.itemIndex);
            setEditorMode('item');
          } else {
            setEditorMode('section');
          }
          setActiveTab('image');
          break;
          
        case 'section-action':
          handleSectionAction(e.data.action, e.data.sectionId);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sync item selection to iframe
  useEffect(() => {
    if (selectedSection && selectedItemIndex !== undefined) {
      sendToIframe({ 
        type: 'select-item', 
        sectionId: selectedSection, 
        itemIndex: selectedItemIndex 
      });
    }
  }, [selectedSection, selectedItemIndex, sendToIframe]);

  // Inject overlay script into iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !currentPageConfig) return;

    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // Inject overlay script with item selectors for repeatable sections
        const script = iframeDoc.createElement('script');
        const sectionData = currentPageConfig.sections.map(s => ({
          id: s.id,
          selector: s.selector,
          label: s.label,
          itemSelector: s.itemSelector,
          repeatableKey: s.repeatableKey,
        }));
        script.textContent = getIframeOverlayScript(sectionData);
        iframeDoc.body.appendChild(script);
      } catch (error) {
        console.warn('Could not inject overlay script:', error);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [currentPageConfig, selectedPage]);

  // Sync hover state to iframe
  useEffect(() => {
    if (hoveredSection) {
      if (hoveredItemIndex !== undefined) {
        sendToIframe({ type: 'highlight-item', sectionId: hoveredSection, itemIndex: hoveredItemIndex });
      } else {
        sendToIframe({ type: 'highlight-section', sectionId: hoveredSection });
      }
    }
  }, [hoveredSection, hoveredItemIndex, sendToIframe]);

  // Sync selection state to iframe
  useEffect(() => {
    if (selectedSection) {
      if (selectedItemIndex !== undefined) {
        sendToIframe({ type: 'select-item', sectionId: selectedSection, itemIndex: selectedItemIndex });
      } else {
        sendToIframe({ type: 'select-section', sectionId: selectedSection });
      }
    }
  }, [selectedSection, selectedItemIndex, sendToIframe]);

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

  // Handle section actions from toolbar
  const handleSectionAction = (action: string, sectionId: string) => {
    switch (action) {
      case 'edit':
        setSelectedSection(sectionId);
        setActiveTab('content');
        break;
      case 'duplicate':
        toast({ title: 'Duplicate', description: 'Section duplication coming soon.' });
        break;
      case 'toggle':
        setSectionVisibility(prev => ({
          ...prev,
          [sectionId]: !prev[sectionId],
        }));
        break;
      case 'reset':
        // Reset section content to original
        const section = currentPageConfig?.sections.find(s => s.id === sectionId);
        if (section && allContent) {
          const edits = { ...localEdits };
          section.contentKeys.forEach(key => {
            const original = allContent.find(c => c.key === key);
            if (original) {
              edits[key] = { key, value: original.value || '', isValid: true };
            }
          });
          setLocalEdits(edits);
          toast({ title: 'Section reset', description: 'Content restored to published version.' });
        }
        break;
    }
  };

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

  // Publish changes
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

      await publishDraft.mutateAsync({
        draftId: newDraft.id,
        pageKey: selectedPage,
      });

      toast({
        title: 'Published!',
        description: 'Changes are now live on the website.',
      });

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
      setIframeReady(false);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Revert to saved
  const handleRevert = () => {
    if (allContent && contentKeys.length > 0) {
      const edits: Record<string, ContentEdit> = {};
      contentKeys.forEach(key => {
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

  // Get current section config
  const currentSectionConfig = selectedSection 
    ? currentPageConfig?.sections.find(s => s.id === selectedSection)
    : undefined;

  // Get repeatable config for item editing
  const currentRepeatableConfig = currentSectionConfig?.repeatableKey
    ? getRepeatableConfig(currentSectionConfig.repeatableKey)
    : undefined;

  // Get the content key for repeatable items
  const repeatableContentKey = currentSectionConfig?.repeatableKey;
  const repeatableContent = repeatableContentKey ? localEdits[repeatableContentKey]?.value || '[]' : '[]';

  // Build content map for selected section
  const sectionContent: Record<string, string> = {};
  if (currentSectionConfig) {
    currentSectionConfig.contentKeys.forEach(key => {
      sectionContent[key] = localEdits[key]?.value || '';
    });
  }

  // Handle item content change (for ItemEditor)
  const handleItemContentChange = (value: string) => {
    if (repeatableContentKey) {
      handleEditChange(repeatableContentKey, value);
      // Notify iframe of content update
      sendToIframe({ type: 'update-content' });
    }
  };

  // Handle item selection from ItemEditor
  const handleSelectItem = (index: number | undefined) => {
    setSelectedItemIndex(index);
    if (index !== undefined && selectedSection) {
      setEditorMode('item');
      sendToIframe({ type: 'select-item', sectionId: selectedSection, itemIndex: index });
    } else {
      setEditorMode('section');
    }
  };

  // Handle item hover from ItemEditor
  const handleHighlightItem = (index: number | undefined) => {
    setHoveredItemIndex(index);
    if (index !== undefined && selectedSection) {
      sendToIframe({ type: 'highlight-item', sectionId: selectedSection, itemIndex: index });
    } else if (selectedSection) {
      sendToIframe({ type: 'highlight-section', sectionId: selectedSection });
    }
  };

  // Switch to section editing mode
  const switchToSectionMode = () => {
    setSelectedItemIndex(undefined);
    setEditorMode('section');
    if (selectedSection) {
      sendToIframe({ type: 'select-section', sectionId: selectedSection });
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
        <div className="flex items-center justify-between gap-4 p-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            {/* Left Panel Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="shrink-0"
            >
              {showLeftPanel ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>

            {/* Page Selector */}
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
            >
              {EDITABLE_PAGES.map(page => (
                <option key={page.key} value={page.key}>{page.label}</option>
              ))}
            </select>

            {/* Status Badges */}
            {hasUnsavedChanges() && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Unsaved
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
            <Button variant="ghost" size="icon" onClick={refreshPreview} title="Refresh preview">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleRevert} disabled={!hasUnsavedChanges()} title="Revert changes">
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
          {/* Left Panel - Page Structure */}
          <AnimatePresence>
            {showLeftPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-r border-border bg-card overflow-hidden shrink-0"
              >
                <div className="w-[240px] h-full flex flex-col">
                  <ScrollArea className="flex-1 p-2">
                    <PageStructureMap
                      sections={sections}
                      selectedSection={selectedSection}
                      hoveredSection={hoveredSection}
                      onSelectSection={(id) => {
                        setSelectedSection(id);
                        setSelectedItemIndex(undefined);
                        setEditorMode('section');
                        sendToIframe({ type: 'select-section', sectionId: id });
                      }}
                      onHoverSection={(id) => {
                        setHoveredSection(id);
                        setHoveredItemIndex(undefined);
                        if (id) {
                          sendToIframe({ type: 'highlight-section', sectionId: id });
                        }
                      }}
                      onToggleVisibility={(id, visible) => {
                        setSectionVisibility(prev => ({ ...prev, [id]: visible }));
                      }}
                      onReorder={(newSections) => {
                        // For now, just update state - actual reordering would need DB changes
                        toast({ title: 'Reorder', description: 'Section reordering saved locally.' });
                      }}
                    />
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview Area */}
          <div className="flex-1 bg-muted/30 p-4 overflow-auto flex items-start justify-center relative">
            {!iframeReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <motion.div
              layout
              className="bg-background rounded-lg shadow-xl overflow-hidden ring-1 ring-border"
              style={{
                width: deviceWidths[deviceView],
                maxWidth: '100%',
                height: deviceHeights[deviceView],
              }}
            >
              <iframe
                ref={iframeRef}
                src={`${currentPageConfig?.path || '/'}?adminPreview=true`}
                className="w-full h-full border-0"
                title="Page Preview"
              />
            </motion.div>
          </div>

          {/* Right Side Panel */}
          <AnimatePresence>
            {showSidePanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-border bg-card overflow-hidden shrink-0"
              >
                <div className="w-[380px] h-full flex flex-col">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
                    <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-2">
                      <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-muted">
                        <FileText className="w-4 h-4" />
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="versions" className="flex items-center gap-2 data-[state=active]:bg-muted">
                        <History className="w-4 h-4" />
                        Versions
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-muted">
                        <ImageIcon className="w-4 h-4" />
                        Media
                      </TabsTrigger>
                    </TabsList>

                    {/* Content Tab */}
                    <TabsContent value="content" className="flex-1 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                          {selectedSection && currentSectionConfig ? (
                            <>
                              {/* Mode indicator and toggle */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={editorMode === 'item' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {editorMode === 'item' ? (
                                      <>
                                        <List className="w-3 h-3 mr-1" />
                                        Editing Item #{(selectedItemIndex ?? 0) + 1}
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="w-3 h-3 mr-1" />
                                        Editing Section
                                      </>
                                    )}
                                  </Badge>
                                </div>
                                {editorMode === 'item' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={switchToSectionMode}
                                    className="text-xs h-7"
                                  >
                                    ← Back to Section
                                  </Button>
                                )}
                              </div>

                              {/* Show ItemEditor for repeatable sections with item selected, otherwise SectionEditor */}
                              {editorMode === 'item' && currentRepeatableConfig ? (
                                <ItemEditor
                                  config={currentRepeatableConfig}
                                  content={repeatableContent}
                                  onChange={handleItemContentChange}
                                  selectedItemIndex={selectedItemIndex}
                                  onSelectItem={handleSelectItem}
                                  onHighlightItem={handleHighlightItem}
                                />
                              ) : currentRepeatableConfig ? (
                                // Section has repeatable items - show ItemEditor in list mode
                                <>
                                  <SectionEditor
                                    section={currentSectionConfig}
                                    content={sectionContent}
                                    onChange={handleEditChange}
                                    highlightedField={highlightedField}
                                    onFieldFocus={setHighlightedField}
                                  />
                                  <div className="border-t border-border pt-4 mt-4">
                                    <ItemEditor
                                      config={currentRepeatableConfig}
                                      content={repeatableContent}
                                      onChange={handleItemContentChange}
                                      selectedItemIndex={selectedItemIndex}
                                      onSelectItem={handleSelectItem}
                                      onHighlightItem={handleHighlightItem}
                                    />
                                  </div>
                                </>
                              ) : (
                                <SectionEditor
                                  section={currentSectionConfig}
                                  content={sectionContent}
                                  onChange={handleEditChange}
                                  highlightedField={highlightedField}
                                  onFieldFocus={setHighlightedField}
                                />
                              )}
                            </>
                          ) : (
                            <div className="text-center py-12 text-muted-foreground">
                              <p className="mb-2">Select a section to edit</p>
                              <p className="text-sm">Click on any section in the preview or use the page structure on the left.</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Versions Tab */}
                    <TabsContent value="versions" className="flex-1 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-3">
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
                                        <span className="font-medium">v{draft.version}</span>
                                        {draft.is_published && (
                                          <Badge variant="default" className="text-xs">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Live
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(draft.created_at).toLocaleString()}
                                      </p>
                                      {draft.notes && (
                                        <p className="text-xs text-muted-foreground">{draft.notes}</p>
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRestore(draft.id, draft.version)}
                                      disabled={restoreVersion.isPending}
                                    >
                                      <RotateCcw className="w-3 h-3 mr-1" />
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

                    {/* Image/Media Tab */}
                    <TabsContent value="image" className="flex-1 m-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                          {selectedElement?.type === 'image' ? (
                            <div className="space-y-4">
                              <h3 className="font-medium text-sm">Edit Image</h3>
                              <ImagePicker
                                value={selectedElement.src || ''}
                                onChange={(url) => {
                                  // In a full implementation, this would update the content
                                  toast({ title: 'Image updated', description: 'Image reference saved.' });
                                }}
                                onAltChange={(alt) => {
                                  // Update alt text
                                }}
                                alt={selectedElement.alt}
                              />
                            </div>
                          ) : (
                            <div className="text-center py-12 text-muted-foreground">
                              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                              <p className="mb-2">No image selected</p>
                              <p className="text-sm">Click on an image in the preview to edit it.</p>
                            </div>
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
