import { useState } from 'react';
import { Send, Image as ImageIcon, Book, MessageSquare, Save, Settings } from 'lucide-react';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是古籍AI助手。我可以帮您提问检索、自动OCR识别古籍图片、自动断句标点（句读）以及古文翻译。请问有什么可以帮您？' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: '这是一个模拟回复。在实际应用中，这里将调用后端的AI大模型接口，提供针对您输入内容的古籍解析、翻译或检索结果。' }]);
    }, 1000);
  };

  return (
    <div className="ai-container">
      <div className="ai-chat-area glass-panel">
        <div className="ai-chat-header">
          <h2 className="font-serif">AI 古籍助手</h2>
          <div className="ai-tools">
            <button className="btn btn-outline" title="提问检索"><MessageSquare size={16} /> 提问检索</button>
            <button className="btn btn-outline" title="自动 OCR"><ImageIcon size={16} /> 自动 OCR</button>
            <button className="btn btn-outline" title="自动句读"><Book size={16} /> 自动句读</button>
            <button className="btn btn-outline" title="自动翻译"><Settings size={16} /> 自动翻译</button>
          </div>
        </div>

        <div className="ai-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="ai-input-area">
          <textarea 
            className="ai-textarea form-control" 
            placeholder="请输入您的问题、或者粘贴古文进行句读/翻译..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="ai-send-btn btn-primary" onClick={handleSend}>
            <Send size={20} />
          </button>
        </div>
      </div>

      <div className="ai-notebook-area glass-panel">
        <div className="notebook-header">
          <h3 className="font-serif">Notebook (我的笔记)</h3>
          <button className="btn-icon" title="保存笔记"><Save size={20} /></button>
        </div>
        <textarea 
          className="notebook-textarea form-control"
          placeholder="您可以在此记录研究灵感、整理AI给出的翻译结果，这些内容将自动保存到您的个人中心..."
        ></textarea>
      </div>
    </div>
  );
};

export default AIAssistant;
