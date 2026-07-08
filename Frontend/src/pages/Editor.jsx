import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const chatEndRef = useRef(null);

  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // AI चैट और डिप्लॉयमेंट स्टेट्स
  const [prompt, setPrompt] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  
  // 🚀 डिप्लॉयमेंट प्रोग्रेस और स्टेट
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStatus, setDeployStatus] = useState('idle'); // idle | deploying | success
  const [isDeployed, setIsDeployed] = useState(false); // ✅ एक बार डिप्लॉय हो गया

  // 🎵 साउंड इफेक्ट फंक्शन
  const playPopSound = (frequency = 600, type = 'sine', duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.log("Audio not supported or blocked by browser policy");
    }
  };

  // ऑटो स्क्रॉल टू बॉटम
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [website?.conversation, updateLoading]);

  // 1. डेटाबेस से वेबसाइट डेटा मंगाना
  useEffect(() => {
    if (id) {
      handleGetWebsite();
    }
  }, [id]);

  const handleGetWebsite = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await axios.get(`${serverUrl}/api/website/get-by-id/${id}`);
      setWebsite(result.data);
      
      // अगर पहले से डिप्लॉय है तो flag set करें
      if (result.data.isDeployed) {
        setIsDeployed(true);
        setDeployStatus('success');
        setDeployProgress(100);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Iframe में पूरा कोड लोड करना
  useEffect(() => {
    if (!iframeRef.current || !website?.latestCode) return;

    const blob = new Blob([website.latestCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;

    return () => URL.revokeObjectURL(url);
  }, [website?.latestCode]);

  // 3. Iframe इंटरेक्शन लॉजिक
  const handleIframeLoad = () => {
    if (!iframeRef.current) return;
    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      const iframeWin = iframeRef.current.contentWindow;

      const links = iframeDoc.querySelectorAll('a, button');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetText = (link.innerText || link.textContent).trim().toLowerCase();
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const element = iframeDoc.getElementById(href.substring(1));
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              return;
            }
          }
          if (typeof iframeWin.navigateToPage === 'function') {
            e.preventDefault();
            iframeWin.navigateToPage(targetText);
          }
        });
      });
    } catch (err) {
      console.log("Iframe interaction attached safely.");
    }
  };

  // 4. AI प्रॉम्प्ट भेजकर कोड को अपडेट करना
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    playPopSound(500, 'sine', 0.05);
    setUpdateLoading(true);
    
    try {
      if (website) {
        setWebsite(prev => ({
          ...prev,
          conversation: [...prev.conversation, { role: "user", content: prompt }]
        }));
      }

      const result = await axios.put(`${serverUrl}/api/website/update/${id}`, { prompt }, {
        withCredentials: true
      });
      
      setWebsite(result.data.website);
      setPrompt("");
      setTimeout(() => playPopSound(800, 'triangle', 0.12), 100);
    } catch (error) {
      console.error("AI Update Error:", error);
      alert("Failed to update website. Please check backend server.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // 5. 🚀 डिप्लॉय फंक्शन - एक बार ही काम करेगा
  const handleDeploy = async () => {
    if (deployStatus === 'deploying' || isDeployed) return;
    
    setDeployStatus('deploying');
    setDeployProgress(0);
    setDeployLoading(true);
    
    // 🎨 एनिमेटेड प्रोग्रेस बार - स्मूथ और अट्रैक्टिव
    const progressInterval = setInterval(() => {
      setDeployProgress(prev => {
        // रैंडम स्पीड से बढ़ाएं (यथार्थवादी लगे)
        const increment = Math.random() * 6 + 1.5;
        const newProgress = Math.min(prev + increment, 95);
        
        // जब 95% पर पहुंच जाए तो इंटरवल क्लियर करें
        if (newProgress >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return newProgress;
      });
    }, 300);

    try {
      const response = await axios.post(`${serverUrl}/api/website/deploy/${id}`, {}, {
        withCredentials: true,
        timeout: 30000
      });
      
      // ✅ सफलता - 100% तक पहुंचाएं
      clearInterval(progressInterval);
      
      // स्मूथ एनिमेशन के लिए 100% तक पहुंचें
      setDeployProgress(100);
      setDeployStatus('success');
      setIsDeployed(true); // 🔒 अब दोबारा डिप्लॉय नहीं हो सकता
      setDeployLoading(false);
      
      // 🎉 सफलता साउंड
      playPopSound(1000, 'sine', 0.15);
      setTimeout(() => playPopSound(1200, 'triangle', 0.1), 150);
      
    } catch (error) {
      // ❌ एरर - रीट्राई का विकल्प
      clearInterval(progressInterval);
      setDeployStatus('error');
      setDeployLoading(false);
      
      console.error("Deploy Error:", error);
      playPopSound(300, 'sawtooth', 0.2);
      
      // एरर के बाद 5 सेकंड बाद रीसेट
      setTimeout(() => {
        if (!isDeployed) {
          setDeployStatus('idle');
          setDeployProgress(0);
        }
      }, 5000);
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-zinc-950 text-white font-sans overflow-hidden">
      
      {/* ─── बायाँ पैनल ─── */}
      <aside className="w-[340px] flex flex-col justify-between bg-zinc-900/40 backdrop-blur-md border-r border-zinc-800/60 h-full">
        
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-2 max-w-[80%]">
            <div className={`w-2.5 h-2.5 rounded-full ${isDeployed ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'} shrink-0`}></div>
            <h1 className="text-xs font-semibold tracking-wider text-zinc-300 uppercase truncate">
              {website ? website.title : "AI Architect Workspace"}
            </h1>
          </div>
          
          <button 
            onClick={() => { if(confirm("Clear chat views?")) handleGetWebsite(); }} 
            title="Refresh logs" 
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
          {website?.conversation?.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              
              {msg.role !== "user" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-indigo-500/10 shrink-0">
                  AI
                </div>
              )}

              <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "user" ? (
                  <div className="bg-indigo-600 text-white text-xs font-medium px-4 py-2.5 rounded-2xl rounded-tr-none shadow-lg border border-indigo-500/20">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none leading-relaxed shadow-sm animate-[fadeIn_0.3s_ease-out]">
                    {msg.content}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-zinc-300 shrink-0">
                  ME
                </div>
              )}
            </div>
          ))}

          {updateLoading && (
            <div className="flex gap-2.5 justify-start items-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 animate-pulse">
                AI
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="text-[11px] font-medium tracking-wide">Updating setup</span>
                <span className="flex gap-0.5 items-center pt-1">
                  <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce"></span>
                </span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleUpdate} className="p-4 bg-zinc-950/40 border-t border-zinc-900">
          <div className="relative flex items-center bg-zinc-900/90 rounded-xl px-3 py-2.5 border border-zinc-800/80 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
            <input
              type="text"
              placeholder={updateLoading ? "AI is rewriting code..." : "Tell AI to tweak something..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={updateLoading}
              className="w-full bg-transparent text-xs text-zinc-100 outline-none placeholder-zinc-500 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={updateLoading || !prompt.trim()} 
              className="ml-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-1.5 rounded-lg hover:from-indigo-400 hover:to-violet-500 transition shadow-md disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </aside>

      {/* ─── दायाँ पैनल ─── */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950">
        
        {/* हेडर - डिप्लॉय बटन एक बार ही दिखेगा */}
        <div className="bg-zinc-950 border-b border-zinc-900/80 px-4 py-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">Live Output Preview</span>
            
            {/* ✅ अगर डिप्लॉय हो चुका है तो बटन नहीं दिखेगा */}
            {!isDeployed ? (
              <button
                onClick={handleDeploy}
                disabled={deployLoading || !website || deployStatus === 'deploying'}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition active:scale-[0.98] ${
                  deployStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/10'
                }`}
              >
                {deployStatus === 'deploying' && (
                  <>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deploying...
                  </>
                )}
                {deployStatus === 'error' && (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Retry Deploy
                  </>
                )}
                {deployStatus === 'idle' && (
                  <>🚀 Deploy Project</>
                )}
              </button>
            ) : (
              // ✅ डिप्लॉय हो गया - सक्सेस बैज दिखाएं
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-xs font-semibold">Deployed Successfully 🎉</span>
              </div>
            )}
          </div>

          {/* 📊 एनिमेटेड प्रोग्रेस बार - डिप्लॉय, सक्सेस, या एरर के दौरान */}
          {(deployStatus === 'deploying' || deployStatus === 'success' || deployStatus === 'error') && (
            <div className="w-full animate-[slideDown_0.4s_ease-out]">
              <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-0.5">
                <span>
                  {deployStatus === 'deploying' && `🚀 Deploying... ${Math.round(deployProgress)}%`}
                  {deployStatus === 'success' && isDeployed && '✅ Successfully Deployed!'}
                  {deployStatus === 'error' && '❌ Deployment Failed - Retry?'}
                </span>
                <span className="font-mono">{Math.round(deployProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    deployStatus === 'success' && isDeployed
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                      : deployStatus === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-red-400'
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500'
                  }`}
                  style={{ 
                    width: `${deployProgress}%`,
                    boxShadow: deployStatus === 'deploying' ? '0 0 15px rgba(99, 102, 241, 0.6)' : 
                                deployStatus === 'success' ? '0 0 15px rgba(52, 211, 153, 0.6)' : 'none'
                  }}
                >
                  {/* ✨ एनिमेटेड शाइन इफेक्ट */}
                  {deployStatus === 'deploying' && (
                    <div className="h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_1.5s_infinite]"></div>
                  )}
                </div>
              </div>
              {deployStatus === 'deploying' && (
                <div className="mt-0.5 flex gap-1.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span>
                  <span className="text-[8px] text-zinc-500">Preparing your project for deployment...</span>
                </div>
              )}
              {deployStatus === 'success' && isDeployed && (
                <div className="mt-0.5 flex gap-1.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[8px] text-emerald-500">Your project is live! 🚀</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 w-full h-full bg-white relative">
          {isLoading && (
            <div className="absolute inset-0 bg-zinc-950 flex flex-col gap-2 items-center justify-center z-50">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[11px] text-zinc-500 tracking-wider uppercase">Loading Workspace...</p>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            title="Live Output"
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
            className="w-full h-full border-none"
          />
        </div>
      </main>
    </div>
  );
}

export default Editor;