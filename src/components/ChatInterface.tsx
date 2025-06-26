
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Send, Bookmark, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'philosopher';
  timestamp: Date;
  isHighlight?: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Greetings, my friend. I understand you're facing a difficult decision between career advancement and family obligations. This is indeed a matter that requires careful consideration of virtue and practical wisdom.",
      sender: 'philosopher',
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Tell me, what specific aspects of this situation weigh most heavily on your mind? Understanding the particular circumstances will help me guide you toward the most virtuous path.",
      sender: 'philosopher',
      timestamp: new Date(),
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState("");

  const philosopher = {
    name: "Aristotle",
    image: "⚖️",
    specialties: ["Virtue Ethics", "Practical Wisdom"],
    onlineStatus: "Reflecting on your dilemma..."
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: currentMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage("");
      
      // Simulate philosopher response
      setTimeout(() => {
        const philosopherResponse: Message = {
          id: messages.length + 2,
          text: "I see that you are grappling with what I call the tension between personal excellence and our duties to others. This is where the concept of the 'golden mean' becomes particularly relevant...",
          sender: 'philosopher',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, philosopherResponse]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleHighlight = (messageId: number) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isHighlight: !msg.isHighlight }
          : msg
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
            </div>
            <Button variant="outline" size="sm">
              End Conversation
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r p-6 hidden lg:block">
          <Card>
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{philosopher.image}</div>
              <CardTitle className="text-xl">{philosopher.name}</CardTitle>
              <p className="text-sm text-muted-foreground">384-322 BCE</p>
              <p className="text-sm text-accent">{philosopher.onlineStatus}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {philosopher.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Bookmark className="h-4 w-4 mr-2" />
                      View Highlights
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Philosopher Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b p-4 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{philosopher.image}</div>
              <div>
                <h3 className="font-bold">{philosopher.name}</h3>
                <p className="text-sm text-muted-foreground">{philosopher.onlineStatus}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-white border shadow-sm'
                  } ${message.isHighlight ? 'ring-2 ring-accent/50' : ''}`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender === 'philosopher' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHighlight(message.id)}
                        className={`h-6 w-6 p-0 ${
                          message.isHighlight ? 'text-accent' : 'text-muted-foreground'
                        }`}
                      >
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts or ask a question..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-accent hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
