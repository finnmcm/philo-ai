
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DilemmaSubmission = () => {
  const [dilemma, setDilemma] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = [
    "Relationships",
    "Career",
    "Family",
    "Ethics",
    "Money",
    "Health",
    "Education",
    "Social Issues",
    "Personal Growth",
    "Friendship"
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (dilemma.trim()) {
      console.log("Submitted dilemma:", dilemma);
      console.log("Selected tags:", selectedTags);
      // Here we would typically navigate to the matching results
    }
  };

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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Share Your Ethical Dilemma
            </h2>
            <p className="text-lg text-muted-foreground">
              Describe your situation in your own words. Our AI will match you with the philosopher 
              whose teachings best address your specific challenge.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Tell Us About Your Dilemma</CardTitle>
              <CardDescription>
                Be as detailed or as brief as you'd like. There's no wrong way to express your thoughts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="dilemma" className="block text-sm font-medium mb-2">
                  Your Dilemma
                </label>
                <Textarea
                  id="dilemma"
                  placeholder="For example: I've been offered my dream job, but it would require me to move far from my aging parents who need support. I'm torn between pursuing my career goals and being there for my family..."
                  value={dilemma}
                  onChange={(e) => setDilemma(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {dilemma.length}/1000 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Category Tags (Optional)
                </label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select relevant categories to help us provide more targeted guidance.
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedTags.includes(category) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(category) 
                          ? "bg-accent hover:bg-accent/90" 
                          : "hover:bg-accent/10"
                      }`}
                      onClick={() => handleTagToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Privacy & Confidentiality</h4>
                <p className="text-sm text-muted-foreground">
                  Your dilemma is kept completely private. We use it only to match you with 
                  relevant philosophical insights and never share personal details.
                </p>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!dilemma.trim()}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                Find My Philosopher Match
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Examples Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-primary mb-6 text-center">
              Need Inspiration? Here Are Some Examples
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Career vs. Values</h4>
                  <p className="text-sm text-muted-foreground">
                    "My company wants me to work on a project that goes against my personal values, 
                    but refusing could hurt my career advancement."
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Friendship Boundaries</h4>
                  <p className="text-sm text-muted-foreground">
                    "My best friend keeps asking to borrow money but never pays it back. 
                    I want to help but I'm starting to feel taken advantage of."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DilemmaSubmission;
