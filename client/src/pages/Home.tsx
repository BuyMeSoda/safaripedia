import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, RefreshCcw, AlertCircle } from "lucide-react";
import { useGenerate } from "@/hooks/use-generate";
import { Textarea } from "@/components/Textarea";
import { Loader } from "@/components/Loader";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const { mutate: generate, data, isPending, error, reset } = useGenerate();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus input on mount
    if (!isPending && !data) {
      inputRef.current?.focus();
    }
  }, [isPending, data]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isPending) return;
    
    generate({ prompt: prompt.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    reset();
    setPrompt("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-24 pb-12 px-6 sm:px-12 selection:bg-black selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl flex flex-col"
      >
        <div className="flex items-center space-x-3 mb-12">
          <div className="h-10 w-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-black/5">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Lumina
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {!data && !isPending && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative group"
            >
              <form onSubmit={handleSubmit}>
                <div className="relative glass-panel rounded-2xl p-2 transition-all duration-300 focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.08)] focus-within:border-black/20">
                  <Textarea
                    ref={inputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What would you like to explore?"
                    className="min-h-[120px] text-lg lg:text-xl border-none shadow-none focus-visible:ring-0 bg-transparent px-4 py-4"
                    disabled={isPending}
                  />
                  
                  <div className="absolute bottom-4 right-4">
                    <button
                      type="submit"
                      disabled={!prompt.trim() || isPending}
                      className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                      aria-label="Generate response"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 px-2 font-medium tracking-wide">
                  Press Return to submit, Shift + Return for new line.
                </p>
              </form>
            </motion.div>
          )}

          {isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2"
            >
              <h2 className="text-xl font-medium mb-6 text-foreground/80">{prompt}</h2>
              <Loader />
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-2xl p-6 border-destructive/20 text-destructive flex items-start space-x-4"
            >
              <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Generation Failed</h3>
                <p className="opacity-90">{error.message}</p>
                <button 
                  onClick={() => generate({ prompt })}
                  className="mt-4 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {data && !isPending && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="border-l-2 border-muted pl-6 ml-2">
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  {prompt}
                </p>
              </div>

              <div className="glass-panel rounded-3xl p-8 sm:p-10">
                <div className="prose prose-lg prose-neutral max-w-none prose-p:leading-relaxed prose-headings:font-display">
                  {/* Using standard whitespace pre-wrap since we don't have a markdown parser requested, 
                      but it still looks incredibly clean. */}
                  <div className="whitespace-pre-wrap text-foreground/90 text-[1.05rem] leading-[1.8]">
                    {data.response}
                  </div>
                </div>
                
                <div className="mt-12 pt-6 border-t border-border flex justify-end">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-black hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span>New Exploration</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
