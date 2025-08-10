import React, { useState } from 'react';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (text: string) => {
    // Create a new message
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user', // In a real app, this would come from auth
      timestamp: new Date().toISOString(),
    };

    // Update UI immediately
    setMessages([...messages, newMessage]);

    try {
      // Send to backend
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage.text,
          sender: newMessage.sender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.text}
            isOutgoing={message.sender === 'user'}
            timestamp={message.timestamp}
          />
        ))}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
