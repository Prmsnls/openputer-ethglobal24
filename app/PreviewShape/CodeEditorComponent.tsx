import React, { useEffect, useState } from 'react'
import AceEditor from 'react-ace'
import 'brace/mode/html'
import 'brace/theme/github'
import Draggable from 'react-draggable'
import { stopEventPropagation } from '@tldraw/tldraw'
import { ExportModal } from './ExportModal'

interface CodeEditorComponentProps {
  localHtml: string
  setLocalHtml: (html: string) => void
  handleSave: (html: string) => void
  closeModal: () => void
}

export const CodeEditorComponent: React.FC<CodeEditorComponentProps> = ({
  localHtml,
  setLocalHtml,
  handleSave,
  closeModal,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = () => {
    setShowExportModal(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave(localHtml);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave, localHtml]);

  return (
    <>
      <Draggable handle=".drag-handle">
        <div 
          style={{ 
            width: window.innerWidth <= 768 ? '100%' : '40%', 
            height: window.innerWidth <= 768 ? '60%' : '80%', 
            position: 'absolute', 
            top: window.innerWidth <= 768 ? '45%' : '10%', 
            left: '0%',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onPointerDown={stopEventPropagation}
          onPointerUp={stopEventPropagation}
          onPointerMove={stopEventPropagation}
        >
          <div className="drag-handle" style={{ 
            cursor: 'move', 
            height: '40px', 
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px'
          }}>
            <span>Code Editor</span>
            <div>
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleExport();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleExport();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '14px',
                  color: '#007bff'
                }}
              >
                Export
              </button>
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave(localHtml);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSave(localHtml);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '14px',
                  color: '#007bff'
                }}
              >
                Save
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeModal();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  closeModal();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#333'
                }}
                onPointerDown={stopEventPropagation}
              >
                &times;
              </button>
            </div>
          </div>
          <AceEditor
            mode="html"
            theme="github"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            value={localHtml}
            onChange={newHtml => setLocalHtml(newHtml)}
            style={{ width: '100%', height: 'calc(100% - 40px)' }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
              wrap: true, // Enable word wrapping
            }}
          />
        </div>
      </Draggable>
      
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        localHtml={localHtml}
      />
    </>
  )
}