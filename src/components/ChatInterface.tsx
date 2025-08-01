import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Send, Bookmark, User } from "lucide-react";
import { useAuthenticated, useUserDiscussions, useUserProfile, useCreateDiscussion, useUpdateDiscussion } from "@/hooks/useUserData";
import { useQueryClient } from "@tanstack/react-query";
import { fetchAuthSession } from "aws-amplify/auth";
import { Discussion } from "./api/userStorage";
import { profile } from "console";


export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'philosopher';
  timestamp: Date;
  isHighlight?: boolean;
}
export const PHILOSOPHER_ICONS: Record<string, string> = {
  aristotle:      '🦉',  // wisdom, Lyceum’s owl
  kant:           '⚖️',  // moral law / justice
  mill:           '🗽',  // liberty (Utilitarianism and freedom)
  nietzsche:      '🐐',  // “God is dead” (the G.O.A.T. of philosophy 😉)
  confucius:      '🎎',  // traditional East Asian doll
  epicurus:       '🍇',  // garden of Epicurus
  plato:          '🏛️',  // Academy / ideal forms
  socrates:       '🍵',  // hemlock cup
  stoic:          '🛡️',  // resilience
  bentham:        '👁️',  // the Panopticon
  hume:           '🔥',  // “heat of passion” vs. reason
  locke:          '🔑',  // “social contract” key
  rousseau:       '🌳',  // “noble savage” in nature
  voltaire:       '✒️',  // satirical pen
  spinoza:        '🍷',  // 17th-c. Dutch philosopher
  descartes:      '💭',  // “I think, therefore I am”
  hegel:          '🔄',  // dialectical process
  schopenhauer:   '😔',  // pessimism
  kierkegaard:    '🐥',  // “knight of faith” (childlike leap)
  marx:           '✊',  // class struggle
  sartre:         '🎭',  // existential “play”
  camus:          '🌅',  // “Sun at noon” of The Myth of Sisyphus
  foucault:       '🏰',  // institutional power
  derrida:        '✂️',  // deconstruction
  wittgenstein:   '🧩',  // language as puzzle
  russell:        '🕊️',  // peace / logical clarity
  popper:         '🎯',  // falsifiability target
  rawls:          '⚖️',  // justice as fairness
  nozick:         '🕹️',  // libertarian “game”
  nussbaum:       '📖',  // capability approach stories
  sen:            '🌐',  // global justice
  chomsky:        '🗣️',  // language & mind
  zizek:          '🎬',  // pop-culture critique
  butler:         '🏳️‍🌈', // gender performativity
  haraway:        '🐾',  // companion species
  latour:         '🧪',  // actor-network trials
  deleuze:        '💫',  // difference & repetition
  guattari:       '🌋',  // schizoanalytic eruption
}

const ChatInterface = () => {
  // All hooks at the top!
  const { id } = useParams<{ id?: string }>();
  const currDiscussionId = id || '';
  const location = useLocation();
  const { isAuthenticated } = useAuthenticated();
  var { data: userDiscussions, isLoading: discussionsIsLoading, refetch: refetchDiscussions } = useUserDiscussions();
  
  // Convert userDiscussions to array of Discussion objects
  const safeUserDiscussions = (() => {
    if (!userDiscussions) return [];
    if (Array.isArray(userDiscussions)) return userDiscussions;
    if (typeof userDiscussions === 'object') {
      // If it's an object, convert to array
      const discussionsArray = Object.values(userDiscussions);
      return discussionsArray;
    }
    return [];
  })();

  const createDiscussionMutation = useCreateDiscussion();
  const updateDiscussionMutation = useUpdateDiscussion();
  const queryClient = useQueryClient();
  const nav = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [discussionType, setDiscussionType] = useState('dilemma');

  const currDiscussion = safeUserDiscussions.find(discussion => discussion.id === currDiscussionId);

  // Get the current philosopher from URL or default to 'aristotle'
  const goToPhilosopherChat = (philosopher: string) => {
    // navigate to "/target-path"
    nav(`/chat/${philosopher}`);
    setMessages(userDiscussions[currDiscussionId].messages);
  };
  const goToSignIn = () => {
    nav('/auth/signin=true')
  }

  // Load messages from current discussion when it changes
  useEffect(() => {
    if (currDiscussion) {
      setMessages(currDiscussion.messages);
    } else {
      setMessages([]);
    }
  }, [currDiscussion]);

  if (discussionsIsLoading) {
    return <div>Loading...</div>;
  }
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

  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: currentMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      try {
        // If no discussion ID exists, generate a new one and navigate to it
        let discussionIdToUse = currDiscussionId;
        if (!discussionIdToUse) {
          discussionIdToUse = crypto.randomUUID();
          console.log('Generated new discussion ID:', discussionIdToUse);
          nav(`/chat/${discussionIdToUse}`);
        }
        
        if (safeUserDiscussions.some(d => d.id === discussionIdToUse)) {
          // Use the mutation to update existing discussion and update cache
          await updateDiscussionMutation.mutateAsync({ 
            discussionId: discussionIdToUse, 
            message: newMessage,
            currDiscussion: currDiscussion
          });
        } else {
          // Use the mutation to create discussion and update cache
          console.log('Creating new discussion with discussionType:', discussionType);
          const newDiscussion = await createDiscussionMutation.mutateAsync({ 
            discussionId: discussionIdToUse, 
            message: newMessage ,
            philosopher: discussionType
          });
          
          // Manually update the local array as a backup
      /*    if (newDiscussion) {
            console.log('Manually adding discussion to array:', newDiscussion);
            // Get the current identity ID from the session
            const session = await fetchAuthSession();
            const identityId = session.identityId;
            
            if (identityId) {
              queryClient.setQueryData(['userDiscussions', identityId], (oldData: any) => {
                const newData = Array.isArray(oldData) ? [...oldData, newDiscussion] : [newDiscussion];
                console.log('Manual cache update - new data:', newData);
                return newData;
              });
            }
          }*/
        }
        
      //  setMessages(prev => [...prev, newMessage]);
        setCurrentMessage("");
      } catch (err) {
        console.log("Unable to send message:", err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </a>
              {isAuthenticated ? 
              (<a href="/account" className="text-muted-foreground hover:text-primary transition-colors">
                My Account
              </a>) : 
              (<Button variant="outline" size="sm" onClick={goToSignIn}>
                Sign In
              </Button>)
            }
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        {isAuthenticated ? (
          <div className="w-80 bg-white border-r p-6 hidden lg:block flex flex-col">
            {/* New Conversation Button - At top */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mb-4 justify-start text-accent border-accent/20 hover:bg-accent/5"
              onClick={() => {
                const newId = crypto.randomUUID();
                console.log('Navigating to new discussion with ID:', newId);
                nav(`/chat/${newId}`);
              }}
            >
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mr-2">
                <span className="text-accent text-sm">+</span>
              </div>
              New Discussion
            </Button>
            
            {/* iMessage-like Contacts List */}
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold text-lg mb-4 text-primary">Conversations</h3>
              <div className="space-y-2 overflow-y-auto pr-2 flex-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {safeUserDiscussions.map((discussion) => {
                const isActive = discussion.id === currDiscussionId;
                const lastMessage = discussion.messages[discussion.messages.length - 1];
                const timestamp = lastMessage ? formatTime(lastMessage.timestamp) : 'No messages';
                
                return (
                  <div
                    key={discussion.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-accent/10 border border-accent/20' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => goToPhilosopherChat(discussion.id)}
                  >
                    <div className="relative">
                      <div className="text-2xl">{/*userDiscussions[currDiscussionId].philosopherId == "" ? "💭" : PHILOSOPHER_ICONS[userDiscussions[currDiscussionId].philosopherId]*/}</div>
                      {isActive && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium text-sm truncate ${
                          isActive ? 'text-accent' : 'text-primary'
                        }`}>
                          {discussion.title || 'New Discussion'}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage ? lastMessage.text : 'Start a new conversation...'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        ) : <></>}
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          {currDiscussion ? (
            <div className="bg-white border-b p-4 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currDiscussion.image}</div>
              <div>
                <h3 className="font-bold">{currDiscussion.name}</h3>
                <p className="text-sm text-muted-foreground">{currDiscussion.onlineStatus}</p>
              </div>
            </div>
          </div>
          ) : <></>}
        

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
                      { name: "Aristotle", avatar: "🦉", id: "aristotle" },
                      { name: "Kant", avatar: "⚖️", id: "kant" },
                      { name: "Mill", avatar: "🗽", id: "mill" },
                      { name: "Nietzsche", avatar: "🐐", id: "nietzsche" }
                    ].map((philosopher) => (
                      <Button
                        key={philosopher.id}
                        variant="outline"
                        size="sm"
                        className={`flex flex-col items-center p-4 h-auto space-y-2 hover:bg-accent/5 ${
                          discussionType === philosopher.id 
                            ? 'bg-accent/10 border-accent text-accent' 
                            : ''
                        }`}
                        onClick={() => {
                          console.log('Philosopher button clicked:', philosopher.id);
                          console.log('Current discussionType:', discussionType);
                          const newType = discussionType === philosopher.id ? 'dilemma' : philosopher.id;
                          console.log('Setting discussionType to:', newType);
                          setDiscussionType(newType);
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
