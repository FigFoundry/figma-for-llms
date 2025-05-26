import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../styles/DefaultView.scss';

// SVG components for copy and success icons
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);

const TickIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

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

// Format token count to show shorter versions for large numbers (1k, 1.5k, etc.)
const formatTokenCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  } else if (count < 10000) {
    // For 1000-9999, show as 1.5k format
    return (Math.round(count / 100) / 10).toFixed(1) + 'k';
  } else {
    // For 10000+, show as 10k format without decimal
    return Math.round(count / 1000) + 'k';
  }
};

const DefaultView = () => {
  const [selectionData, setSelectionData] = useState<any>(null);
  const [includeChildren, setIncludeChildren] = useState(true);
  const [activeTab, setActiveTab] = useState('minified');
  const [copied, setCopied] = useState(false);
  
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
    
    // Show success state
    setCopied(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    // Show Figma native notification
    parent.postMessage({
      pluginMessage: {
        type: 'notify',
        message: 'Copied to clipboard!'
      }
    }, '*');
  };

  // Set placeholder JSON when no selection is made
  useEffect(() => {
    if (!selectionData) {
      const placeholder = {
        message: "Select an element(s)"
      };
      setPrettyJson(JSON.stringify(placeholder, null, 2));
      setMinifiedJson(JSON.stringify(placeholder));
      // Don't set token counts for placeholder
      setPrettyTokenCount(0);
      setMinifiedTokenCount(0);
    }
  }, [selectionData]);

  return (
    <div className="container">
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'minified' ? 'active' : ''}`}
          onClick={() => setActiveTab('minified')}
        >
          <span>Mini JSON</span>
        </button>
        <button 
          className={`tab ${activeTab === 'pretty' ? 'active' : ''}`}
          onClick={() => setActiveTab('pretty')}
        >
          <span>Pretty JSON</span>
        </button>
      </div>
      
      <div className="content-options">
        <div className="left-options">
          <label className="expand-option" title="When checked, includes all nested children in the JSON output. Includes all levels of the hierarchy.">
            <input 
              type="checkbox" 
              checked={includeChildren} 
              onChange={() => setIncludeChildren(!includeChildren)}
            />
            Include children
          </label>
        </div>
        
        {(prettyTokenCount > 0 || minifiedTokenCount > 0) && (
          <div className="token-count">
            {activeTab === 'pretty' 
              ? `${formatTokenCount(prettyTokenCount)} tokens` 
              : `${formatTokenCount(minifiedTokenCount)} tokens`}
          </div>
        )}
      </div>
      
      <div className={`json-container ${activeTab === 'pretty' ? 'pretty-view' : 'minified-view'}`}>
        <button 
          className="copy-icon-button" 
          onClick={() => copyToClipboard(activeTab === 'pretty' ? prettyJson : minifiedJson)}
          title="Copy to clipboard"
        >
          {copied ? <TickIcon /> : <CopyIcon />}
        </button>
        <div className="json-content">
          <SyntaxHighlighter
            language="json"
            style={{
              ...vscDarkPlus,
              'code[class*="language-"]': {
                ...vscDarkPlus['code[class*="language-"]'],
                color: 'var(--figma-color-text)',
                fontFamily: 'var(--monospace)',
                WebkitFontSmoothing: 'antialiased',
                fontWeight: 400,
                fontSize: '.688rem',
                lineHeight: '.688rem',
                letterSpacing: '.005em'
              },
              'pre[class*="language-"]': {
                ...vscDarkPlus['pre[class*="language-"]'],
                color: 'var(--figma-color-text)',
                fontFamily: 'var(--monospace)',
                WebkitFontSmoothing: 'antialiased',
                fontWeight: 400,
                fontSize: '.688rem',
                lineHeight: '.688rem',
                letterSpacing: '.005em'
              }
            }}
            customStyle={{
              margin: 0,
              padding: 'var(--s-08)',
              background: 'transparent',
              color: 'var(--figma-color-text)',
              fontFamily: 'var(--monospace)',
              WebkitFontSmoothing: 'antialiased',
              fontWeight: 400,
              fontSize: '.688rem',
              lineHeight: '.688rem',
              letterSpacing: '.005em',
              wordBreak: activeTab === 'minified' ? 'break-all' : 'normal',
              whiteSpace: activeTab === 'minified' ? 'pre-wrap' : 'pre',
              width: '100%',
              overflowX: activeTab === 'pretty' ? 'auto' : 'hidden',
              overflowY: 'auto'
            }}
            codeTagProps={{
              style: {
                color: 'var(--figma-color-text)',
                fontFamily: 'var(--monospace)',
                WebkitFontSmoothing: 'antialiased',
                fontWeight: 400,
                fontSize: '.688rem',
                lineHeight: '.688rem',
                letterSpacing: '.005em'
              }
            }}
            wrapLines={activeTab === 'minified'}
            wrapLongLines={activeTab === 'minified'}
          >
            {activeTab === 'pretty' ? prettyJson : minifiedJson}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default DefaultView;