interface MessageBubbleProps {
  message: string;
  isOutgoing: boolean;
  timestamp: string;
}

export function MessageBubble({ message, isOutgoing, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOutgoing ? 'bg-green-500 text-white' : 'bg-white'
        }`}
      >
        <p className="text-sm">{message}</p>
        <p className="text-xs opacity-75 mt-1">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
