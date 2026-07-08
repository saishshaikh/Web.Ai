import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Wand2, Loader2, AlertCircle, Coins } from "lucide-react";
import axios from "axios";
import { serverUrl } from "../App";

const Generate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  
  // 🔥 क्रेडिट खत्म होने का स्टेट मैनेज करने के लिए
  const [isCreditExhausted, setIsCreditExhausted] = useState(false);

  const generationPhases = [
    { text: "Analyzing your brilliant idea...", targetProgress: 15 },
    { text: "Planning website structure and layout...", targetProgress: 35 },
    { text: "Writing clean HTML5 & Tailwind CSS code...", targetProgress: 65 },
    { text: "Adding custom dynamic components and logic...", targetProgress: 85 },
    { text: "Finalizing, compiling and deploying live...", targetProgress: 98 }
  ];

  useEffect(() => {
    let timer;
    if (isGenerating) {
      timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          const currentTarget = generationPhases[currentPhaseIndex]?.targetProgress || 100;
          if (oldProgress < currentTarget) {
            return oldProgress + 1;
          } else if (currentPhaseIndex < generationPhases.length - 1) {
            setCurrentPhaseIndex((prev) => prev + 1);
          }
          return oldProgress;
        });
      }, 150);
    } else {
      setProgress(0);
      setCurrentPhaseIndex(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating, currentPhaseIndex]);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setIsCreditExhausted(false); // रिसेट करें
    setProgress(2); 

    try {
      const response = await axios.post(
        `${serverUrl}/api/website/generate`,
        { prompt: prompt.trim() },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      setProgress(100);
      setTimeout(() => {
        const websiteId = response.data?.websiteId || response.data?._id;
        if (websiteId) navigate(`/editor/${websiteId}`);
        else navigate("/dashboard");
      }, 500);

    } catch (err) {
      console.error("Generation failed:", err);
      setIsGenerating(false);

      // 🔍 चेक करें कि क्या एरर मैसेज में क्रेडिट लिमिट की बात की गई है
      const errorMsg = err.response?.data?.message?.toLowerCase() || "";
      if (
        err.response?.status === 400 && 
        (errorMsg.includes("credit") || errorMsg.includes("insufficient") || errorMsg.includes("quota") || errorMsg.includes("limit"))
      ) {
        setIsCreditExhausted(true);
      } else {
        // अगर कोई और 400 एरर है तो आप चाहें तो डिफ़ॉल्ट रूप से भी अलर्ट दिखा सकते हैं साफ़ समझने के लिए
        setIsCreditExhausted(true); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased flex flex-col justify-between relative selection:bg-zinc-800">
      
      {/* ─── क्रेडिट खत्म होने का प्रीमियम अलर्ट बॉक्स (Modal) ─── */}
      <AnimatePresence>
        {isCreditExhausted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-purple-950/10"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Coins size={22} className="animate-bounce" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-100 tracking-wide">
                  AI Generation Credit Exhausted
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Oops! Your free AI compilation tokens have ended. Please check your API keys configuration or top-up credits.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsCreditExhausted(false);
                    navigate("/dashboard");
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setIsCreditExhausted(false)}
                  className="w-full py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition"
                >
                  Try Again / Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── टॉप बार ─── */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-900/60 bg-black/20 backdrop-blur-md">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition" />
          <span>Genweb.ai</span>
        </button>
        <div className="flex items-center gap-1.5 bg-zinc-900/50 border border-zinc-800 px-2.5 py-1 rounded-full text-[10px] text-zinc-400 font-medium">
          <Sparkles size={10} className="text-purple-400" /> AI Engine v2.0
        </div>
      </header>

      {/* ─── मुख्य कंटेंट ─── */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto px-6 py-12">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            Build Websites with <br />
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-extrabold">
              Real AI Power
            </span>
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm max-w-md mx-auto">
            This process may take several minutes. genweb.ai focuses on quality, not shortcuts.
          </p>
        </div>

        <form onSubmit={handleGenerateSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 tracking-wide block">
              Describe your website
            </label>
            <div className="relative group rounded-xl bg-zinc-900/30 border border-zinc-800/80 focus-within:border-zinc-700 transition duration-300">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., create animated portfolio website for me my name is Ayush Sahu , black and white theme..."
                disabled={isGenerating}
                rows={5}
                className="w-full bg-transparent text-zinc-200 placeholder-zinc-600 p-4 text-sm focus:outline-none resize-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className={`px-8 py-3 rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 flex items-center gap-2 shadow-lg ${
                isGenerating 
                  ? "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin text-purple-500" />
                  Generating components...
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  Generate Website
                </>
              )}
            </button>
          </div>
        </form>

        {/* प्रोग्रेस बार */}
        <div className="w-full max-w-xl mt-12 min-h-[80px]">
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center text-xs font-mono px-1">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                    <span>{generationPhases[currentPhaseIndex]?.text || "Processing..."}</span>
                  </div>
                  <span className="text-purple-400 font-bold">{progress}%</span>
                </div>

                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 text-center font-mono">
                  Estimated time remaining: <span className="text-zinc-400">~1-2 minutes</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="h-12 border-t border-zinc-900/40 flex items-center justify-center text-[10px] text-zinc-600 font-mono">
        &copy; 2026 genweb.ai • Powered by Advanced Large Language Models
      </footer>
    </div>
  );
};

export default Generate;