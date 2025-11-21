import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatBox({ messages = [], onSendMessage, currentUserId }) {
  const [message, setMessage] = useState('');
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sender._id === currentUserId;
          return (
            <div
              key={index}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs ${isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg px-4 py-2`}>
                {!isOwnMessage && (
                  <p className="text-xs font-semibold mb-1">{msg.sender.name}</p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {formatDistanceToNow(new Date(msg.time), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
