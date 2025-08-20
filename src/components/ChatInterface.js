import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatInterface = ({ knowledgeBase }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Здесь нужно будет заменить на реальный API ключ Yandex GPT
      const response = await axios.post('/api/chat', {
        message: inputMessage,
        knowledgeBase: knowledgeBase
      }, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_YANDEX_GPT_API_KEY'
        }
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response || 'Извините, произошла ошибка при получении ответа.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Извините, произошла ошибка при отправке сообщения. Проверьте подключение к API.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Чат с Yandex GPT</h3>
        {knowledgeBase && (
          <span className="knowledge-base-status">
            База знаний активна
          </span>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Привет! Я AI-агент на основе Yandex GPT.</p>
            {knowledgeBase ? (
              <p>Я изучил предоставленную базу знаний и готов ответить на ваши вопросы!</p>
            ) : (
              <p>Загрузите PDF файл выше, чтобы я мог работать с базой знаний.</p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-timestamp">{message.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите ваше сообщение..."
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
