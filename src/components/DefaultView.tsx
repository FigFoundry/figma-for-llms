import React, { useState, useEffect } from 'react';
import '../styles/DefaultView.scss';

// Function to calculate tokens more accurately
function calculateTokens(text: string): number {
  if (!text) return 0;
  
  // Count tokens based on different types of content
  // This is a more accurate approximation than just dividing by 4
  
  // Count words (good approximation for natural language)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  // Count special characters (brackets, quotes, etc. in JSON)
  const specialChars = (text.match(/[{}\[\]",:]/g) || []).length;
  
  // Count numbers (which are often single tokens)
  const numbers = (text.match(/\d+(\.\d+)?/g) || []).length;
  
  // Combine with appropriate weights
  // For JSON, structure characters and numbers are significant
  return Math.max(1, Math.round(wordCount * 1.3 + specialChars * 0.3 + numbers * 0.5));
}

const DefaultView = () => {
  const [selectionData, setSelectionData] = useState<any>(null);
  const [includeChildren, setIncludeChildren] = useState(true);
  const [activeTab, setActiveTab] = useState('pretty');
  
  // Safely handle JSON data
  const [prettyJson, setPrettyJson] = useState('');
  const [minifiedJson, setMinifiedJson] = useState('');
  const [prettyTokenCount, setPrettyTokenCount] = useState(0);
  const [minifiedTokenCount, setMinifiedTokenCount] = useState(0);
  
  // Update JSON strings when selection data changes
  useEffect(() => {
    if (selectionData) {
      try {
        // Get the first selected item if it's an array, or use the data as is
        const dataToShow = Array.isArray(selectionData) && selectionData.length === 1 
          ? selectionData[0] 
          : selectionData;
        
        const pretty = JSON.stringify(dataToShow, null, 2);
        const minified = JSON.stringify(dataToShow);
        
        setPrettyJson(pretty);
        setMinifiedJson(minified);
        // More accurate token calculation
        // GPT models generally use ~4 chars per token on average, but it varies by content
        // This is still an approximation but better than a fixed divisor
        setPrettyTokenCount(calculateTokens(pretty));
        setMinifiedTokenCount(calculateTokens(minified));
      } catch (error) {
        console.error('Error stringifying selection data:', error);
      }
    } else {
      setPrettyJson('');
      setMinifiedJson('');
      setPrettyTokenCount(0);
      setMinifiedTokenCount(0);
    }
  }, [selectionData]);

  useEffect(() => {
    // Listen for messages from the plugin (canvas.ts)
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      
      if (message && message.type === 'selectionChange') {
        setSelectionData(message.data);
      }
    };
    
    // Send initialization message to get initial selection data
    parent.postMessage({
      pluginMessage: {
        type: 'init'
      }
    }, '*');
  }, []);
  
  // Send message to the plugin when include children toggle changes
  useEffect(() => {
    if (selectionData) {
      parent.postMessage({
        pluginMessage: {
          type: 'toggleExpand',
          expandContent: includeChildren
        }
      }, '*');
    }
  }, [includeChildren, selectionData]);

  const copyToClipboard = (text: string) => {
    // Copy to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show Figma native notification
    parent.postMessage({
      pluginMessage: {
        type: 'notify',
        message: 'Copied to clipboard!'
      }
    }, '*');
  };

  if (!selectionData) {
    return (
      <div className="empty-state">
        <div className="icon">{ }</div>
        <p>Select an element in Figma to view its raw data</p>
      </div>
    );
  }

  return (
    <div className="container">
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pretty' ? 'active' : ''}`}
          onClick={() => setActiveTab('pretty')}
        >
          <span>Pretty JSON</span>
        </button>
        <button 
          className={`tab ${activeTab === 'minified' ? 'active' : ''}`}
          onClick={() => setActiveTab('minified')}
        >
          <span>Minified JSON</span>
        </button>
      </div>
      
      <div className="token-count">
        {activeTab === 'pretty' ? `${prettyTokenCount} tokens` : `${minifiedTokenCount} tokens`}
      </div>
      
      <div className="content-options">
        <label className="expand-option" title="When checked, includes all nested children in the JSON output. Includes all levels of the hierarchy.">
          <input 
            type="checkbox" 
            checked={includeChildren} 
            onChange={() => setIncludeChildren(!includeChildren)}
          />
          Include Children
        </label>
        
        <button 
          className="copy-button" 
          onClick={() => copyToClipboard(activeTab === 'pretty' ? prettyJson : minifiedJson)}
        >
          Copy {activeTab === 'pretty' ? 'Pretty' : 'Minified'} JSON
        </button>
      </div>
      
      <div className="json-container">
        <pre className="json-content">
          {activeTab === 'pretty' ? prettyJson : minifiedJson}
        </pre>
      </div>
    </div>
  );
};

export default DefaultView;