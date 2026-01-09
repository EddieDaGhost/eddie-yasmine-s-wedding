import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Eye, EyeOff, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export interface PageSection {
  id: string;
  label: string;
  contentKey: string;
  visible: boolean;
  children?: PageSection[];
}

interface PageStructureMapProps {
  sections: PageSection[];
  selectedSection?: string;
  onSelectSection: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onReorder: (sections: PageSection[]) => void;
}

export const PageStructureMap = ({
  sections,
  selectedSection,
  onSelectSection,
  onToggleVisibility,
  onReorder,
}: PageStructureMapProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedItem) {
      setDragOverItem(id);
    }
  };

  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem !== dragOverItem) {
      const newSections = [...sections];
      const draggedIndex = newSections.findIndex(s => s.id === draggedItem);
      const dropIndex = newSections.findIndex(s => s.id === dragOverItem);
      
      const [removed] = newSections.splice(draggedIndex, 1);
      newSections.splice(dropIndex, 0, removed);
      
      onReorder(newSections);
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="space-y-1">
      {sections.map((section) => (
        <motion.div
          key={section.id}
          draggable
          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, section.id)}
          onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, section.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors',
            selectedSection === section.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
            dragOverItem === section.id && 'border-2 border-dashed border-primary',
            draggedItem === section.id && 'opacity-50'
          )}
          onClick={() => onSelectSection(section.id)}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          
          <span className="flex-1 text-sm truncate">{section.label}</span>
          
          <Switch
            checked={section.visible}
            onCheckedChange={(checked) => onToggleVisibility(section.id, checked)}
            onClick={(e) => e.stopPropagation()}
            className="scale-75"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default PageStructureMap;
