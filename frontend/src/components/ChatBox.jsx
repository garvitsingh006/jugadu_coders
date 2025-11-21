import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Send, Bot, Sparkles, Edit3, Check, X } from 'lucide-react';

export default function ChatBox({ messages = [], onSendMessage, onEditMessage, currentUserId }) {
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleEdit = (msg) => {
    setEditingId(msg._id || msg.time);
    setEditText(msg.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(editingId, editText);
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isOwnMessage = msg.sender?._id === currentUserId;
            const isAI = msg.isAI;
            const msgId = msg._id || msg.time;
            const isEditing = editingId === msgId;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`max-w-xs lg:max-w-md relative ${
                  isAI 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : isOwnMessage 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                      : 'glass border border-gray-700/50 text-gray-100'
                } rounded-2xl px-4 py-3 shadow-lg`}>
                  
                  {isAI && (
                    <div className="flex items-center space-x-2 mb-2">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <span className="text-xs font-bold">VibeCircle AI</span>
                    </div>
                  )}
                  
                  {!isOwnMessage && !isAI && msg.sender && (
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {msg.sender.name}
                    </p>
                  )}
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-sm leading-relaxed flex-1">{msg.text}</p>
                      {isOwnMessage && !isAI && (
                        <button
                          onClick={() => handleEdit(msg)}
                          className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700/30 rounded transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!isEditing && (
                    <p className={`text-xs mt-2 opacity-70`}>
                      {formatDistanceToNow(new Date(msg.time), { addSuffix: true })}
                      {msg.edited && <span className="ml-1">(edited)</span>}
                    </p>
                  )}
                  
                  {/* Message tail */}
                  <div className={`absolute top-3 ${
                    isOwnMessage ? '-right-2' : '-left-2'
                  } w-4 h-4 transform rotate-45 ${
                    isAI 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : isOwnMessage 
                        ? 'bg-green-600' 
                        : 'bg-gray-800/90 border-l border-t border-gray-700/50'
                  }`} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <motion.form 
        onSubmit={handleSubmit} 
        className="border-t border-white/20 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-field"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-4 py-3 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
