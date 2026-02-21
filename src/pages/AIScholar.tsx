import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Volume2, Loader2, Search, ArrowLeft, Lightbulb } from "lucide-react";
import InteractiveMascot from "@/components/InteractiveMascot";

interface AIResponse {
  originalText: string;
  transliteration: string;
  type: string;
  englishMeaning: string;
  hindiMeaning: string;
  grammarBreakdown: string;
  exampleSentenceSanskrit?: string;
  exampleSentenceMeaning?: string;
}

const AIScholar = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const playAudio = useCallback((textToSpeak: string) => {
    if (!window.speechSynthesis || voices.length === 0) return;
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const hindiVoice = voices.find(v => v.lang === "hi-IN" || v.name.includes("Hindi"));
    utterance.voice = hindiVoice || voices.find(v => v.default) || voices[0];
    utterance.lang = "hi-IN";
    utterance.rate = 0.8; 
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/analyze-sanskrit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze text");
      setResult(data);
    } catch (error: any) {
      console.error(error);
      alert(`Scholar Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </Button>
            </Link>
            <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Scholar
            </h1>
          </div>
          <Sparkles className="w-6 h-6 text-accent animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-10 mt-6 pb-20">
        <div className="relative overflow-hidden bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-8 group">
          <div className="relative z-10">
            {/* Mascot set to happy permanently */}
            <InteractiveMascot mood="happy" size="lg" />
          </div>
          <div className="text-center md:text-left relative z-10">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">
              Sanskrit Knowledge Hub
            </h2>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Explore the profound depth of Sanskrit literature. Paste a word, sentence, or a sacred Shloka to begin.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex gap-3 bg-card p-2 rounded-3xl border-2 border-border shadow-lg">
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Sanskrit text (e.g., कर्म, योगश्चित्तवृत्तिनिरोधः)"
              className="h-14 text-lg border-0 bg-transparent focus-visible:ring-0 px-6 flex-1 font-medium"
            />
            <Button 
              type="submit" 
              disabled={loading || !query.trim()} 
              className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <div className="flex items-center gap-2"><Search className="w-5 h-5" /> <span>Analyze</span></div>}
            </Button>
          </div>
        </form>

        {result && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="bg-card border-border/40 shadow-2xl rounded-[3rem] overflow-hidden">
              <div className="bg-gradient-to-br from-primary/90 to-primary-dark p-10 text-white relative">
                 <div className="absolute top-6 right-8">
                   <Button 
                     size="icon" 
                     className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-90"
                     onClick={() => playAudio(result.originalText)}
                     disabled={isPlaying}
                   >
                     <Volume2 className={`w-8 h-8 ${isPlaying ? 'text-accent animate-pulse' : 'text-white'}`} />
                   </Button>
                 </div>
                 <div className="space-y-4">
                   <span className="bg-accent/20 border border-accent/30 text-accent-foreground text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg inline-block backdrop-blur-sm">
                     {result.type}
                   </span>
                   <h3 className="text-6xl font-bold font-display leading-tight drop-shadow-md">
                     {result.originalText}
                   </h3>
                   <p className="text-primary-foreground/70 text-xl font-medium tracking-wide">
                     {result.transliteration}
                   </p>
                 </div>
              </div>

              <CardContent className="p-10 space-y-12">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group bg-muted/20 hover:bg-primary/5 p-8 rounded-[2rem] border border-border/50 transition-colors">
                    <p className="text-xs font-black text-primary/60 uppercase tracking-widest mb-4">English Definition</p>
                    <p className="text-2xl font-semibold text-foreground leading-snug">{result.englishMeaning}</p>
                  </div>
                  <div className="group bg-muted/20 hover:bg-accent/5 p-8 rounded-[2rem] border border-border/50 transition-colors">
                    <p className="text-xs font-black text-accent/60 uppercase tracking-widest mb-4">Hindi Meaning (हिन्दी)</p>
                    <p className="text-2xl font-semibold text-foreground leading-snug">{result.hindiMeaning}</p>
                  </div>
                </div>

                {/* Refined Etymology & Grammar Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest">Etymology & Grammar</h4>
                  </div>
                  <div className="bg-muted/10 p-8 rounded-[2rem] border-l-4 border-primary">
                    <ul className="space-y-4">
                      {result.grammarBreakdown.split('. ').filter(p => p.trim() !== "").map((part, i) => (
                        <li key={i} className="flex gap-4 items-start group">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span className="text-lg text-foreground/90 leading-relaxed font-medium">
                            {part.trim()}{part.endsWith('.') ? '' : '.'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {result.exampleSentenceSanskrit && (
                  <div className="pt-8 border-t border-border">
                    <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6">Usage in Context</h4>
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-10 rounded-[2.5rem] border border-primary/10 flex flex-col md:flex-row items-center gap-8">
                       <div className="flex-1 text-center md:text-left space-y-3">
                          <p className="text-3xl font-bold text-primary font-display">{result.exampleSentenceSanskrit}</p>
                          <p className="text-lg text-muted-foreground italic font-medium">"{result.exampleSentenceMeaning}"</p>
                       </div>
                       <Button 
                         variant="outline" 
                         className="rounded-2xl border-primary/20 hover:bg-primary/10 px-6 h-12 gap-2 font-bold"
                         onClick={() => playAudio(result.exampleSentenceSanskrit || "")}
                       >
                         <Volume2 className="w-4 h-4" /> Listen
                       </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIScholar;