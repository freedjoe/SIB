import ChatInterface from "@/components/chat/ChatInterface";

export default function Chat() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      <ChatInterface />
    </div>
  );
}
