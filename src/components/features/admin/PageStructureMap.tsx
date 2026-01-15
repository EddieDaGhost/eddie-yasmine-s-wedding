import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Eye, EyeOff, ChevronRight, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface PageSection {
  id: string;
  label: string;
  contentKeys: string[];
  visible: boolean;
  selector?: string;
  hasRepeatableItems?: boolean;
  repeatableKey?: string;
}

interface PageStructureMapProps {
  sections: PageSection[];
  selectedSection?: string;
  hoveredSection?: string;
  onSelectSection: (id: string) => void;
  onHoverSection: (id: string | null) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onReorder: (sections: PageSection[]) => void;
}

/**
 * Left sidebar showing page structure with drag-and-drop reordering.
 * Syncs with iframe preview via hover/select callbacks.
 */
export const PageStructureMap = ({
  sections,
  selectedSection,
  hoveredSection,
  onSelectSection,
  onHoverSection,
  onToggleVisibility,
  onReorder,
}: PageStructureMapProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedItem) {
      setDragOverItem(id);
    }
  }, [draggedItem]);

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && targetId && draggedItem !== targetId) {
      const newSections = [...sections];
      const draggedIndex = newSections.findIndex(s => s.id === draggedItem);
      const dropIndex = newSections.findIndex(s => s.id === targetId);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        const [removed] = newSections.splice(draggedIndex, 1);
        newSections.splice(dropIndex, 0, removed);
        onReorder(newSections);
      }
    }
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, sections, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  return (
    <div className="space-y-1">
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Page Structure
      </div>
      
      {sections.map((section, index) => {
        const isSelected = selectedSection === section.id;
        const isHovered = hoveredSection === section.id;
        const isDragging = draggedItem === section.id;
        const isDragOver = dragOverItem === section.id;

        return (
          <motion.div
            key={section.id}
            layout
            initial={false}
            animate={{
              opacity: isDragging ? 0.5 : 1,
              scale: isDragging ? 0.98 : 1,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, section.id)}
            onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e as unknown as React.DragEvent, section.id)}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => onHoverSection(section.id)}
            onMouseLeave={() => onHoverSection(null)}
            className={cn(
              'group flex items-center gap-2 px-2 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
              isSelected && 'bg-primary/10 text-primary ring-1 ring-primary/30',
              isHovered && !isSelected && 'bg-muted/70',
              !isSelected && !isHovered && 'hover:bg-muted/50',
              isDragOver && 'ring-2 ring-dashed ring-primary bg-primary/5',
            )}
            onClick={() => onSelectSection(section.id)}
          >
            <GripVertical 
              className={cn(
                'w-4 h-4 cursor-grab active:cursor-grabbing transition-colors',
                isSelected ? 'text-primary/70' : 'text-muted-foreground/50 group-hover:text-muted-foreground'
              )} 
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium truncate',
                  isSelected && 'text-primary'
                )}>
                  {section.label}
                </span>
                {!section.visible && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                    Hidden
                  </Badge>
                )}
                {section.hasRepeatableItems && (
                  <span title="Contains repeating items">
                    <List className="w-3 h-3 text-muted-foreground" />
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {section.contentKeys.length} field{section.contentKeys.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(section.id, !section.visible);
              }}
              className={cn(
                'p-1 rounded transition-colors',
                section.visible 
                  ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                  : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted'
              )}
              title={section.visible ? 'Hide section' : 'Show section'}
            >
              {section.visible ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
            
            <ChevronRight className={cn(
              'w-4 h-4 transition-colors',
              isSelected ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-muted-foreground/50'
            )} />
          </motion.div>
        );
      })}
      
      {sections.length === 0 && (
        <div className="px-2 py-8 text-center text-sm text-muted-foreground">
          No sections found
        </div>
      )}
    </div>
  );
};

export default PageStructureMap;
