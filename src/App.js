import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import PDFUploader from './components/PDFUploader';

function App() {
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [isKnowledgeBaseLoaded, setIsKnowledgeBaseLoaded] = useState(false);

  const handleKnowledgeBaseUpdate = (text) => {
    setKnowledgeBase(text);
    setIsKnowledgeBaseLoaded(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Yandex GPT Chat</h1>
        <p>Чат с AI-агентом на основе Yandex GPT</p>
      </header>
      
      <main className="App-main">
        <PDFUploader onKnowledgeBaseUpdate={handleKnowledgeBaseUpdate} />
        
        {isKnowledgeBaseLoaded && (
          <div className="knowledge-base-info">
            <p>✅ База знаний загружена ({knowledgeBase.length} символов)</p>
          </div>
        )}
        
        <ChatInterface knowledgeBase={knowledgeBase} />
      </main>
    </div>
  );
}

export default App;
