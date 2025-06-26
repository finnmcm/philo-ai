
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, ArrowRight } from "lucide-react";

const PhilosopherMatch = () => {
  // This would typically come from props or API
  const matchedPhilosopher = {
    name: "Aristotle",
    era: "384-322 BCE",
    image: "⚖️",
    specialties: ["Virtue Ethics", "Practical Wisdom", "Character Development"],
    keyWorks: ["Nicomachean Ethics", "Politics", "Metaphysics"],
    matchReason: "Aristotle's emphasis on practical wisdom and finding the balanced mean between extremes makes him ideal for navigating complex decisions that involve competing values and responsibilities.",
    relevantQuote: "The good of the community is greater and more perfect than the good of the individual.",
    description: "Aristotle believed that ethical behavior comes from developing good character traits (virtues) and applying practical wisdom to specific situations. He would help you find the balanced approach between career ambition and family duty."
  };

  const alternativeMatches = [
    {
      name: "Immanuel Kant",
      image: "🏛️",
      focus: "Duty & Universal Principles",
      matchPercentage: 78
    },
    {
      name: "Confucius",
      image: "🎋",
      focus: "Family & Social Harmony",
      matchPercentage: 72
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Match Results Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Your Philosopher Match
            </h2>
            <p className="text-lg text-muted-foreground">
              Based on your dilemma, we've found the perfect philosophical guide for you.
            </p>
          </div>

          {/* Main Match */}
          <Card className="shadow-xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl">{matchedPhilosopher.image}</div>
                  <div>
                    <h3 className="text-3xl font-bold">{matchedPhilosopher.name}</h3>
                    <p className="text-lg opacity-90">{matchedPhilosopher.era}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">94%</div>
                  <div className="text-sm opacity-90">Match</div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-lg mb-3 text-primary">Why This Match?</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {matchedPhilosopher.matchReason}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-3 text-primary">Key Specialties</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {matchedPhilosopher.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="bg-accent/10">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <h5 className="font-semibold mb-2">Notable Works:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {matchedPhilosopher.keyWorks.map((work, index) => (
                      <li key={index}>• {work}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg mb-6">
                <h4 className="font-bold text-lg mb-3 text-primary">A Relevant Insight</h4>
                <blockquote className="text-lg italic text-muted-foreground mb-4">
                  "{matchedPhilosopher.relevantQuote}"
                </blockquote>
                <p className="text-muted-foreground">
                  {matchedPhilosopher.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white flex-1">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chat with Aristotle
                </Button>
                <Button variant="outline" size="lg">
                  View Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Matches */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary mb-6">
              Other Great Matches
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {alternativeMatches.map((philosopher, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{philosopher.image}</div>
                        <div>
                          <h4 className="font-bold text-lg">{philosopher.name}</h4>
                          <p className="text-sm text-muted-foreground">{philosopher.focus}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">{philosopher.matchPercentage}%</div>
                        <div className="text-xs text-muted-foreground">Match</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Chat with {philosopher.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg">
                Submit Another Dilemma
              </Button>
              <Button variant="outline" size="lg">
                Browse All Philosophers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhilosopherMatch;
