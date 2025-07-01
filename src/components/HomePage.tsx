
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, MessageSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const nav = useNavigate();
  const goToDilemma = () => {
    // navigate to "/target-path"
    nav('/chat');
  };
  const featuredPhilosophers = [
    {
      name: "Aristotle",
      focus: "Virtue Ethics & Practical Wisdom",
      description: "Navigate complex moral choices through virtue and character development.",
      image: "🏛️"
    },
    {
      name: "Immanuel Kant",
      focus: "Duty & Universal Principles",
      description: "Discover ethical clarity through reason and universal moral laws.",
      image: "⚖️"
    },
    {
      name: "John Stuart Mill",
      focus: "Utilitarianism & Social Good",
      description: "Evaluate choices by their consequences for overall human welfare.",
      image: "🌟"
    }
  ];

  const userStories = [
    {
      dilemma: "Career vs. Family Time",
      philosopher: "Aristotle",
      insight: "Helped me find balance through the golden mean between work ambition and family devotion."
    },
    {
      dilemma: "Honest Feedback to Friend",
      philosopher: "Kant",
      insight: "Showed me how to give truthful advice while respecting my friend's autonomy."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
            <a href="/chat" className="text-muted-foreground hover:text-primary transition-colors">
                Chat
              </a>
              <a href="/explore" className="text-muted-foreground hover:text-primary transition-colors">
                Explore Philosophers
              </a>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Get Philosophy-Backed Insight on Your Dilemmas
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with history's greatest thinkers to navigate your ethical challenges. 
              From Aristotle to Kant, discover personalized guidance for life's tough decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg" onClick={goToDilemma}>
                Submit Your Dilemma
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg" onClick={() => nav('/explore')}>
                Explore Philosophers
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-primary mb-12">
            How PhiloAI Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">1. Share Your Dilemma</h4>
              <p className="text-muted-foreground">
                Describe your ethical challenge in simple terms. No philosophy background needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">2. Get Matched</h4>
              <p className="text-muted-foreground">
                Our AI connects you with the philosopher whose teachings best address your situation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-xl font-semibold mb-2">3. Start Conversations</h4>
              <p className="text-muted-foreground">
                Chat with your philosopher and receive personalized guidance based on their teachings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Philosophers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-primary mb-12">
            Featured Philosophers
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPhilosophers.map((philosopher, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">{philosopher.image}</div>
                  <CardTitle className="text-xl">{philosopher.name}</CardTitle>
                  <CardDescription className="font-medium text-accent">
                    {philosopher.focus}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{philosopher.description}</p>
                  <Button variant="outline" className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Success Stories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-primary mb-12">
            Real Stories, Real Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {userStories.map((story, index) => (
              <Card key={index} className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">"{story.dilemma}"</h4>
                    <p className="text-sm text-accent font-medium">
                      Guidance from {story.philosopher}
                    </p>
                  </div>
                  <p className="text-muted-foreground italic">
                    "{story.insight}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Explore Your Ethical Dilemma?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who've found clarity through philosophical wisdom. 
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Submit Your Dilemma
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg text-white border-white hover:bg-white hover:text-primary">
              Sign Up Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p> A Finn McMillan Production</p>
          </div>
      </footer>
    </div>
  );
};

export default HomePage;
