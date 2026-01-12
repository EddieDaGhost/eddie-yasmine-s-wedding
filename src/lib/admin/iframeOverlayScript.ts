/**
 * Script to be injected into the preview iframe for overlay handling.
 * Communicates with parent via postMessage.
 * Supports section selection, item selection within repeating sections, and element highlighting.
 */

export interface SectionData {
  id: string;
  selector: string;
  label: string;
  itemSelector?: string;
  repeatableKey?: string;
}

export const getIframeOverlayScript = (sections: SectionData[]) => {
  return `
(function() {
  // Avoid re-initialization
  if (window.__visualEditorInitialized) return;
  window.__visualEditorInitialized = true;

  const sections = ${JSON.stringify(sections)};
  let selectedSection = null;
  let selectedItemIndex = null;
  let hoveredSection = null;
  let hoveredItemIndex = null;
  let overlayContainer = null;
  let toolbarElement = null;

  // Create overlay container
  function createOverlayContainer() {
    overlayContainer = document.createElement('div');
    overlayContainer.id = 'visual-editor-overlays';
    overlayContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99999;';
    document.body.appendChild(overlayContainer);
  }

  // Create section overlay
  function createSectionOverlay(rect, section, isSelected) {
    const overlay = document.createElement('div');
    overlay.className = 'section-overlay';
    overlay.dataset.sectionId = section.id;
    overlay.style.cssText = \`
      position: absolute;
      top: \${rect.top + window.scrollY}px;
      left: \${rect.left + window.scrollX}px;
      width: \${rect.width}px;
      height: \${rect.height}px;
      border: 2px \${isSelected ? 'solid' : 'dashed'} \${isSelected ? '#8b5cf6' : 'rgba(139, 92, 246, 0.5)'};
      background: \${isSelected ? 'rgba(139, 92, 246, 0.08)' : 'transparent'};
      pointer-events: none;
      transition: all 0.15s ease;
      border-radius: 4px;
    \`;

    // Label badge
    const label = document.createElement('div');
    label.style.cssText = \`
      position: absolute;
      top: -1px;
      left: -1px;
      background: \${isSelected ? '#8b5cf6' : 'rgba(139, 92, 246, 0.85)'};
      color: white;
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 0 0 4px 0;
      font-family: system-ui, sans-serif;
      white-space: nowrap;
    \`;
    label.textContent = section.label;
    overlay.appendChild(label);

    overlayContainer.appendChild(overlay);
    return overlay;
  }

  // Create item overlay for repeating items
  function createItemOverlay(rect, section, itemIndex, isSelected) {
    const overlay = document.createElement('div');
    overlay.className = 'item-overlay';
    overlay.dataset.sectionId = section.id;
    overlay.dataset.itemIndex = itemIndex;
    overlay.style.cssText = \`
      position: absolute;
      top: \${rect.top + window.scrollY}px;
      left: \${rect.left + window.scrollX}px;
      width: \${rect.width}px;
      height: \${rect.height}px;
      border: 2px \${isSelected ? 'solid' : 'dashed'} \${isSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.5)'};
      background: \${isSelected ? 'rgba(245, 158, 11, 0.08)' : 'transparent'};
      pointer-events: none;
      transition: all 0.15s ease;
      border-radius: 4px;
    \`;

    // Item badge
    const label = document.createElement('div');
    label.style.cssText = \`
      position: absolute;
      top: -1px;
      right: -1px;
      background: \${isSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.85)'};
      color: white;
      font-size: 10px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 0 0 0 4px;
      font-family: system-ui, sans-serif;
    \`;
    label.textContent = '#' + (itemIndex + 1);
    overlay.appendChild(label);

    overlayContainer.appendChild(overlay);
    return overlay;
  }

  // Create floating toolbar for selected section
  function createToolbar(rect, section) {
    if (toolbarElement) {
      toolbarElement.remove();
    }

    toolbarElement = document.createElement('div');
    toolbarElement.className = 'section-toolbar';
    toolbarElement.style.cssText = \`
      position: absolute;
      top: \${rect.top + window.scrollY - 40}px;
      right: \${window.innerWidth - rect.right - window.scrollX}px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: flex;
      gap: 2px;
      padding: 4px;
      pointer-events: auto;
      z-index: 100000;
      font-family: system-ui, sans-serif;
    \`;

    const buttons = [
      { action: 'edit', label: 'Edit', icon: '✏️' },
      { action: 'duplicate', label: 'Duplicate', icon: '📋' },
      { action: 'toggle', label: 'Toggle', icon: '👁️' },
      { action: 'reset', label: 'Reset', icon: '↺' },
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.style.cssText = \`
        background: transparent;
        border: none;
        padding: 6px 8px;
        cursor: pointer;
        font-size: 12px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
        color: #374151;
        transition: background 0.15s;
      \`;
      button.innerHTML = \`<span>\${btn.icon}</span><span>\${btn.label}</span>\`;
      button.onmouseenter = () => button.style.background = '#f3f4f6';
      button.onmouseleave = () => button.style.background = 'transparent';
      button.onclick = (e) => {
        e.stopPropagation();
        window.parent.postMessage({
          type: 'section-action',
          action: btn.action,
          sectionId: section.id
        }, '*');
      };
      toolbarElement.appendChild(button);
    });

    overlayContainer.appendChild(toolbarElement);
  }

  // Clear all overlays
  function clearOverlays() {
    if (overlayContainer) {
      overlayContainer.innerHTML = '';
    }
    toolbarElement = null;
  }

  // Update overlays based on current state
  function updateOverlays() {
    clearOverlays();
    if (!overlayContainer) createOverlayContainer();

    sections.forEach(section => {
      const element = document.querySelector(section.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const isSelected = selectedSection === section.id;
        const isHovered = hoveredSection === section.id;
        
        if (isSelected || isHovered) {
          createSectionOverlay(rect, section, isSelected);
          if (isSelected) {
            createToolbar(rect, section);
          }
        }

        // Handle repeating items within section
        if (section.itemSelector) {
          const items = element.querySelectorAll(section.itemSelector);
          items.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const isItemSelected = isSelected && selectedItemIndex === index;
            const isItemHovered = isHovered && hoveredItemIndex === index;
            
            if (isItemSelected || isItemHovered) {
              createItemOverlay(itemRect, section, index, isItemSelected);
            }
          });
        }
      }
    });
  }

  // Find section from element
  function findSectionFromElement(element) {
    for (const section of sections) {
      const sectionEl = document.querySelector(section.selector);
      if (sectionEl && (sectionEl === element || sectionEl.contains(element))) {
        return section;
      }
    }
    return null;
  }

  // Find item index within a section
  function findItemIndex(element, section) {
    if (!section.itemSelector) return -1;
    
    const sectionEl = document.querySelector(section.selector);
    if (!sectionEl) return -1;
    
    const items = sectionEl.querySelectorAll(section.itemSelector);
    for (let i = 0; i < items.length; i++) {
      if (items[i] === element || items[i].contains(element)) {
        return i;
      }
    }
    return -1;
  }

  // Handle mouse move for hover detection
  document.addEventListener('mousemove', (e) => {
    const section = findSectionFromElement(e.target);
    const newHovered = section ? section.id : null;
    let newHoveredItem = -1;
    
    if (section && section.itemSelector) {
      newHoveredItem = findItemIndex(e.target, section);
    }
    
    if (newHovered !== hoveredSection || newHoveredItem !== hoveredItemIndex) {
      hoveredSection = newHovered;
      hoveredItemIndex = newHoveredItem >= 0 ? newHoveredItem : null;
      updateOverlays();
    }
  });

  // Handle click for selection
  document.addEventListener('click', (e) => {
    const section = findSectionFromElement(e.target);
    
    if (section) {
      e.preventDefault();
      e.stopPropagation();
      
      selectedSection = section.id;
      
      // Check if clicking on a repeating item
      if (section.itemSelector) {
        const itemIndex = findItemIndex(e.target, section);
        if (itemIndex >= 0) {
          selectedItemIndex = itemIndex;
          
          // Notify parent of item selection
          window.parent.postMessage({
            type: 'item-selected',
            sectionId: section.id,
            itemIndex: itemIndex,
            repeatableKey: section.repeatableKey
          }, '*');
        } else {
          selectedItemIndex = null;
        }
      } else {
        selectedItemIndex = null;
      }
      
      updateOverlays();
      
      // Notify parent of section selection
      window.parent.postMessage({
        type: 'section-selected',
        sectionId: section.id,
        itemIndex: selectedItemIndex
      }, '*');
    }
  }, true);

  // Handle text/image element clicks
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Check if it's an editable text element
    if (target.matches('h1, h2, h3, h4, h5, h6, p, span, a, li')) {
      e.preventDefault();
      e.stopPropagation();
      
      // Highlight the element
      target.style.outline = '2px solid #8b5cf6';
      target.style.outlineOffset = '2px';
      
      // Find parent section and item
      const section = findSectionFromElement(target);
      let itemIndex = -1;
      if (section && section.itemSelector) {
        itemIndex = findItemIndex(target, section);
      }
      
      window.parent.postMessage({
        type: 'text-element-selected',
        sectionId: section?.id || null,
        itemIndex: itemIndex >= 0 ? itemIndex : null,
        text: target.textContent,
        tagName: target.tagName.toLowerCase(),
        path: getElementPath(target)
      }, '*');
    }
    
    // Check if it's an image
    if (target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      
      target.style.outline = '2px solid #8b5cf6';
      target.style.outlineOffset = '2px';
      
      const section = findSectionFromElement(target);
      let itemIndex = -1;
      if (section && section.itemSelector) {
        itemIndex = findItemIndex(target, section);
      }
      
      window.parent.postMessage({
        type: 'image-element-selected',
        sectionId: section?.id || null,
        itemIndex: itemIndex >= 0 ? itemIndex : null,
        src: target.src,
        alt: target.alt,
        path: getElementPath(target)
      }, '*');
    }
  }, true);

  // Get element path for identification
  function getElementPath(el) {
    const parts = [];
    while (el && el !== document.body) {
      let selector = el.tagName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
      } else if (el.className && typeof el.className === 'string') {
        selector += '.' + el.className.split(' ').filter(c => c).join('.');
      }
      parts.unshift(selector);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  // Listen for messages from parent
  window.addEventListener('message', (e) => {
    if (e.data.type === 'highlight-section') {
      const sectionId = e.data.sectionId;
      hoveredSection = sectionId;
      updateOverlays();
      
      // Scroll to section
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        const element = document.querySelector(section.selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    
    if (e.data.type === 'highlight-item') {
      const { sectionId, itemIndex } = e.data;
      hoveredSection = sectionId;
      hoveredItemIndex = itemIndex;
      updateOverlays();
      
      // Scroll to item
      const section = sections.find(s => s.id === sectionId);
      if (section && section.itemSelector) {
        const sectionEl = document.querySelector(section.selector);
        if (sectionEl) {
          const items = sectionEl.querySelectorAll(section.itemSelector);
          if (items[itemIndex]) {
            items[itemIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
    
    if (e.data.type === 'select-section') {
      selectedSection = e.data.sectionId;
      selectedItemIndex = e.data.itemIndex ?? null;
      updateOverlays();
      
      // Scroll to section
      const section = sections.find(s => s.id === selectedSection);
      if (section) {
        const element = document.querySelector(section.selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    
    if (e.data.type === 'select-item') {
      const { sectionId, itemIndex } = e.data;
      selectedSection = sectionId;
      selectedItemIndex = itemIndex;
      updateOverlays();
      
      // Scroll to item
      const section = sections.find(s => s.id === sectionId);
      if (section && section.itemSelector) {
        const sectionEl = document.querySelector(section.selector);
        if (sectionEl) {
          const items = sectionEl.querySelectorAll(section.itemSelector);
          if (items[itemIndex]) {
            items[itemIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
    
    if (e.data.type === 'clear-selection') {
      selectedSection = null;
      selectedItemIndex = null;
      hoveredSection = null;
      hoveredItemIndex = null;
      updateOverlays();
    }
    
    if (e.data.type === 'update-content') {
      // Refresh the page to show updated content
      window.location.reload();
    }
    
    if (e.data.type === 'clear-element-highlight') {
      document.querySelectorAll('[style*="outline: 2px solid"]').forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
    }
  });

  // Update overlays on scroll/resize
  window.addEventListener('scroll', updateOverlays, { passive: true });
  window.addEventListener('resize', updateOverlays, { passive: true });

  // Initial setup
  createOverlayContainer();
  
  // Notify parent that editor is ready
  window.parent.postMessage({ type: 'editor-ready' }, '*');
})();
`;
};
