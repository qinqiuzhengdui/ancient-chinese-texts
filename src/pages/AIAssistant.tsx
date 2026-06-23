import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Book, MessageSquare, Save, Settings } from 'lucide-react';
import { streamChatAPI, type ChatMessage } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '您好！我是古籍AI助手（驱动引擎：DeepSeek-V3）。我可以帮您提问检索、自动OCR识别古籍图片、自动断句标点（句读）以及古文翻译。请问有什么可以帮您？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Placeholder for the assistant's streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    streamChatAPI(
      newMessages,
      // onChunk: Append text chunk to the last message
      (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + chunk
          };
          return updated;
        });
      },
      // onError: Append error message
      (error) => {
        console.error(error);
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + `\n\n[发生错误]: ${error}`
          };
          return updated;
        });
        setLoading(false);
      },
      // onDone: Re-enable inputs
      () => {
        setLoading(false);
      }
    );
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
              <div className="message-content markdown-body">
                {msg.content ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      code(props) {
                        const {children, className, node, ...rest} = props
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                            style={vscDarkPlus as any}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : ''}
                {(loading && idx === messages.length - 1 && !msg.content) && (
                  <span className="loading-indicator">大模型正在思考...</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-area">
          <textarea 
            className="ai-textarea form-control" 
            placeholder="请输入您的问题、或者粘贴古文进行句读/翻译..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="ai-send-btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
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
