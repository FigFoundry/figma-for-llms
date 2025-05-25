// Show UI with appropriate size
figma.showUI(__html__, { themeColors: true, width: 400, height: 500 });

// Listen for messages from the UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'toggleExpand') {
    // When expand setting changes, send updated selection data
    sendSelectionToUI(msg.expandContent);
  } else if (msg.type === 'notify') {
    // Show a notification
    figma.notify(msg.message);
  } else if (msg.type === 'init') {
    // Send initial selection data when UI is ready
    sendSelectionToUI(true);
  }
};

// Helper function to extract color information including hex
function extractColor(color: RGB | RGBA): any {
  const colorObj: any = {
    r: color.r,
    g: color.g,
    b: color.b
  };
  
  // Add alpha if available
  if ('a' in color) {
    colorObj.a = color.a;
  } else {
    colorObj.a = 1;
  }
  
  // Add hex representation
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  colorObj.hex = `#${r}${g}${b}`;
  
  return colorObj;
}

// Helper function to extract paint properties
function extractPaints(paints: readonly Paint[]): any[] {
  return paints.map(paint => {
    const paintData: any = {
      type: paint.type,
      opacity: 'opacity' in paint ? paint.opacity : 1
    };
    
    // Extract color for solid paints
    if (paint.type === 'SOLID' && 'color' in paint) {
      paintData.color = extractColor(paint.color);
    }
    
    // Handle other paint types as needed
    return paintData;
  });
}

// Function to extract complete node data
function extractNodeData(node: SceneNode, expandContent: boolean): any {
  // Basic properties all nodes have
  const nodeData: any = {
    name: node.name,
    type: node.type
  };
  
  // Add geometric properties
  if ('width' in node) nodeData.width = node.width;
  if ('height' in node) nodeData.height = node.height;
  
  // Add layout properties
  if ('layoutMode' in node) nodeData.layoutMode = node.layoutMode;
  if ('primaryAxisSizingMode' in node) nodeData.primaryAxisSizingMode = node.primaryAxisSizingMode;
  if ('counterAxisSizingMode' in node) nodeData.counterAxisSizingMode = node.counterAxisSizingMode;
  if ('primaryAxisAlignItems' in node) nodeData.primaryAxisAlignItems = node.primaryAxisAlignItems;
  if ('counterAxisAlignItems' in node) nodeData.counterAxisAlignItems = node.counterAxisAlignItems;
  
  // Add fill properties
  if ('fills' in node && Array.isArray(node.fills)) {
    nodeData.fills = extractPaints(node.fills);
  }
  
  // Add stroke properties
  if ('strokes' in node && Array.isArray(node.strokes)) {
    nodeData.strokes = extractPaints(node.strokes);
  }
  if ('strokeWeight' in node && typeof node.strokeWeight === 'number') {
    nodeData.strokeWeight = node.strokeWeight;
  }
  if ('strokeAlign' in node && typeof node.strokeAlign === 'string') {
    nodeData.strokeAlign = node.strokeAlign;
  }
  if ('strokeCap' in node && typeof node.strokeCap === 'string') {
    nodeData.strokeCap = node.strokeCap;
  }
  if ('strokeJoin' in node && typeof node.strokeJoin === 'string') {
    nodeData.strokeJoin = node.strokeJoin;
  }
  
  // Add children
  if ('children' in node) {
    if (expandContent) {
      nodeData.children = [];
      for (const child of (node as any).children) {
        nodeData.children.push(extractNodeData(child, expandContent));
      }
    } else {
      nodeData.childrenCount = (node as any).children.length;
    }
  }
  
  return nodeData;
}

// Function to send selection data to UI
function sendSelectionToUI(expandContent = false) {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'selectionChange',
      data: null
    });
    return;
  }
  
  try {
    // Extract complete data for each selected node
    const selectionData = selection.map(node => extractNodeData(node, expandContent));
    
    // Send the data to the UI
    figma.ui.postMessage({
      type: 'selectionChange',
      data: selectionData
    });
  } catch (error) {
    console.error('Error sending selection data:', error);
    figma.ui.postMessage({
      type: 'error',
      message: 'Failed to process selection data'
    });
  }
}

// Listen for selection changes
figma.on('selectionchange', () => {
  sendSelectionToUI(false); // Default to not expanded
});

// Send initial selection data with expanded content by default
sendSelectionToUI(true);