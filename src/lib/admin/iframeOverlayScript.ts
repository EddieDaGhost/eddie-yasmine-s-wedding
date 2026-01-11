/**
 * Script to be injected into the preview iframe for overlay handling.
 * Communicates with parent via postMessage.
 */

export const getIframeOverlayScript = (sections: { id: string; selector: string; label: string }[]) => {
  return `
(function() {
  // Avoid re-initialization
  if (window.__visualEditorInitialized) return;
  window.__visualEditorInitialized = true;

  const sections = ${JSON.stringify(sections)};
  let selectedSection = null;
  let hoveredSection = null;
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

  // Handle mouse move for hover detection
  document.addEventListener('mousemove', (e) => {
    const section = findSectionFromElement(e.target);
    const newHovered = section ? section.id : null;
    
    if (newHovered !== hoveredSection) {
      hoveredSection = newHovered;
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
      updateOverlays();
      
      // Notify parent of selection
      window.parent.postMessage({
        type: 'section-selected',
        sectionId: section.id
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
      
      // Find parent section
      const section = findSectionFromElement(target);
      
      window.parent.postMessage({
        type: 'text-element-selected',
        sectionId: section?.id || null,
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
      
      window.parent.postMessage({
        type: 'image-element-selected',
        sectionId: section?.id || null,
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
    
    if (e.data.type === 'select-section') {
      selectedSection = e.data.sectionId;
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
    
    if (e.data.type === 'clear-selection') {
      selectedSection = null;
      hoveredSection = null;
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
