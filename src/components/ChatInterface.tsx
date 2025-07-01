import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
  const { philosopher } = useParams<{ philosopher?: string }>();
  const location = useLocation();
  
  // Get the current philosopher from URL or default to 'aristotle'
  const currentPhilosopher = philosopher || 'aristotle';
  
  const nav = useNavigate();
  const goToPhilosopherChat = (philosopher: string) => {
    // navigate to "/target-path"
    nav(`/chat/${philosopher}`);
  };

  const [messages, setMessages] = useState<Message[]>([
    /*
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
    }*/
  ]);
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Aristotle",
      avatar: "⚖️",
      lastMessage: "The golden mean between extremes...",
      timestamp: "2 min ago",
      unread: 0,
      isActive: currentPhilosopher === 'aristotle'
    },
    {
      id: 2,
      name: "Immanuel Kant",
      avatar: "🏛️",
      lastMessage: "Act only according to that maxim...",
      timestamp: "1 hour ago",
      unread: 2,
      isActive: currentPhilosopher === 'immanuelkant'
    },
    {
      id: 3,
      name: "John Stuart Mill",
      avatar: "🌟",
      lastMessage: "The greatest happiness principle...",
      timestamp: "3 hours ago",
      unread: 0,
      isActive: currentPhilosopher === 'johnstuartmill'
    },
    {
      id: 4,
      name: "Confucius",
      avatar: "🎋",
      lastMessage: "The superior man is modest...",
      timestamp: "Yesterday",
      unread: 1,
      isActive: currentPhilosopher === 'confucius'
    },
    {
      id: 5,
      name: "Epicurus",
      avatar: "🍇",
      lastMessage: "Pleasure is the beginning and end...",
      timestamp: "2 days ago",
      unread: 0,
      isActive: currentPhilosopher === 'epicurus'
    }
  ]);

  // Philosopher data mapping
  const philosopherData = {
    aristotle: {
      name: "Aristotle",
      image: "⚖️",
      specialties: ["Virtue Ethics", "Practical Wisdom"],
      onlineStatus: "Reflecting on your dilemma...",
      era: "384-322 BCE"
    },
    kant: {
      name: "Immanuel Kant",
      image: "🏛️",
      specialties: ["Duty Ethics", "Universal Principles"],
      onlineStatus: "Contemplating moral laws...",
      era: "1724-1804"
    },
    mill: {
      name: "John Stuart Mill",
      image: "🌟",
      specialties: ["Utilitarianism", "Social Good"],
      onlineStatus: "Calculating greatest happiness...",
      era: "1806-1873"
    },
    confucius: {
      name: "Confucius",
      image: "🎋",
      specialties: ["Social Harmony", "Virtuous Leadership"],
      onlineStatus: "Seeking the way...",
      era: "551-479 BCE"
    },
    epicurus: {
      name: "Epicurus",
      image: "🍇",
      specialties: ["Hedonism", "Tranquility"],
      onlineStatus: "Finding pleasure in wisdom...",
      era: "341-270 BCE"
    }
  };

  // Get current philosopher info or default to Aristotle
  const philosopherInfo = philosopherData[currentPhilosopher as keyof typeof philosopherData] || philosopherData.aristotle;

  // Update conversations active state when currentPhilosopher changes
  useEffect(() => {
    setConversations(prev => prev.map(conv => ({
      ...conv,
      isActive: conv.name.toLowerCase().replace(/\s+/g, "") === currentPhilosopher
    })));
  }, [currentPhilosopher]);

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
            <div className="flex items-center space-x-2" onClick={() => nav('/')}>
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/explore" className="text-muted-foreground hover:text-primary transition-colors">
                Explore Philosophers
              </a>
              <a href="/home" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r p-6 hidden lg:block">
          {/* iMessage-like Contacts List */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-primary">Conversations</h3>
            <div className="space-y-2">
              {conversations.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    contact.isActive 
                      ? 'bg-accent/10 border border-accent/20' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => goToPhilosopherChat(contact.name.toLowerCase().replace(/\s+/g, ""))}
                >
                  <div className="relative">
                    <div className="text-2xl">{contact.avatar}</div>
                    {contact.isActive && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm truncate ${
                        contact.isActive ? 'text-accent' : 'text-primary'
                      }`}>
                        {contact.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {contact.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">
                        {contact.lastMessage}
                      </p>
                      {contact.unread > 0 && (
                        <div className="ml-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                          {contact.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* New Conversation Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 justify-start text-accent border-accent/20 hover:bg-accent/5"
              onClick={() => {
                const newId = Math.max(...conversations.map(c => c.id)) + 1;
                const newConversation = {
                  id: newId,
                  name: "New Discussion",
                  avatar: "💭",
                  lastMessage: "Start a new conversation...",
                  timestamp: "Just now",
                  unread: 0,
                  isActive: false
                };
                setConversations(prev => [...prev, newConversation]);
              }}
            >
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mr-2">
                <span className="text-accent text-sm">+</span>
              </div>
              New Discussion
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b p-4 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{philosopherInfo.image}</div>
              <div>
                <h3 className="font-bold">{philosopherInfo.name}</h3>
                <p className="text-sm text-muted-foreground">{philosopherInfo.onlineStatus}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col justify-center items-center h-full space-y-8">
                <div className="text-center max-w-2xl">
                  <h3 className="text-xl font-semibold text-primary mb-4">Welcome to PhiloAI</h3>
                  <p className="text-muted-foreground mb-6">
                    You can either <strong>submit a dilemma</strong> for personalized guidance, or choose a philosopher directly below.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Aristotle", avatar: "⚖️", id: "aristotle" },
                      { name: "Kant", avatar: "🏛️", id: "kant" },
                      { name: "Mill", avatar: "🌟", id: "mill" },
                      { name: "Nietzsche", avatar: "🎋", id: "nietzsche" }
                    ].map((philosopher) => (
                      <Button
                        key={philosopher.id}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-accent/5"
                        onClick={() => {
                          // Check if conversation already exists
                          const existingConversation = conversations.find(conv => 
                            conv.name.toLowerCase().replace(/\s+/g, "") === philosopher.id
                          );
                          
                          if (existingConversation) {
                            // Navigate to existing conversation
                            goToPhilosopherChat(philosopher.id);
                          } else {
                            // Update current conversation with new philosopher
                            const philosopherData = {
                              aristotle: { name: "Aristotle", avatar: "⚖️" },
                              kant: { name: "Immanuel Kant", avatar: "🏛️" },
                              mill: { name: "John Stuart Mill", avatar: "🌟" },
                              confucius: { name: "Confucius", avatar: "🎋" }
                            };
                            
                            const newPhilosopher = philosopherData[philosopher.id as keyof typeof philosopherData];
                            
                            // Update conversations list to highlight the new philosopher
                            setConversations(prev => prev.map(conv => ({
                              ...conv,
                              isActive: conv.name === newPhilosopher.name
                            })));
                          }
                        }}
                      >
                        <div className="text-2xl">{philosopher.avatar}</div>
                        <span className="text-xs font-medium">{philosopher.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
