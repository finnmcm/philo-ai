import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, BookOpen, Filter } from "lucide-react";
import { usePhilosophers } from "../hooks/usePhilosophers";
import { useAuthenticated } from "@/hooks/useUserData";


const ExplorePhilosophers = () => {
  const nav = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const { data: philosophers, isLoading, error} = usePhilosophers();
  const {isAuthenticated} = useAuthenticated();
  const navigate = useNavigate();
  const goToSignIn = () => {
    navigate("/auth=signin");
  }

  if (!philosophers){
    return<div>Loading</div>;
  }
  const eras = [
    { id: "all", name: "All Eras" },
    { id: "ancient", name: "Ancient (Before 500 CE)" },
    { id: "medieval", name: "Medieval (500-1500)" },
    { id: "modern", name: "Modern (1500-1900)" },
    { id: "contemporary", name: "Contemporary (1900+)" }
  ];

  const getEraCategory = (era: string) => {
    const year = parseInt(era.split(" ")[0]);
    if (year < 500) return "ancient";
    if (year < 1500) return "medieval";
    if (year < 1900) return "modern";
    return "contemporary";
  };
  
  const filteredPhilosophers = Object.values(philosophers).filter(philosopher => {
    const matchesSearch = philosopher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         philosopher.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         philosopher.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEra = selectedEra === "all" || getEraCategory(philosopher.era) === selectedEra;
    
    return matchesSearch && matchesEra;
  });

  const startConversation = (philosopherId: string) => {
    nav(`/chat/${philosopherId}`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={() => nav('/')}>
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <div className="flex-1"></div>
              <a href="/chat" className="text-muted-foreground hover:text-primary transition-colors">
                Chat
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

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Explore Philosophers</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover different philosophical perspectives and find the right philosopher to guide you through your ethical dilemma.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search philosophers, specialties, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                {eras.map(era => (
                  <option key={era.id} value={era.id}>{era.name}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredPhilosophers.length} philosopher{filteredPhilosophers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Philosophers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhilosophers.map((philosopher) => (
            <Card key={philosopher.id} className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-3">{philosopher.image}</div>
                <CardTitle className="text-xl">{philosopher.name}</CardTitle>
                <CardDescription className="font-medium text-accent">
                  {philosopher.era}
                </CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-2">
                    {/*
                  <Badge variant="outline" className="text-xs">
                    {philosopher.matchPercentage}% Match
                  </Badge>
                  */}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {philosopher.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {philosopher.description}
                </p>
                
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Key Works</h4>
                  <p className="text-xs text-muted-foreground">
                    {philosopher.keyWorks.join(", ")}
                  </p>
                </div>
                
                <blockquote className="text-sm italic text-muted-foreground border-l-2 border-accent/30 pl-3">
                  "{philosopher.quote}"
                </blockquote>
                
                <Button 
                  onClick={() => startConversation(philosopher.id)}
                  className="w-full bg-accent hover:bg-accent/90 group-hover:bg-accent/95"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPhilosophers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-semibold text-primary mb-2">No philosophers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find the philosopher you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePhilosophers;