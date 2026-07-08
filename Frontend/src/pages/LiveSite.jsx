import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';

function LiveSite() {
  const { slug } = useParams(); // URL से slug पकड़ने के लिए (:slug)
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        setLoading(true);
        setError("");
        
        // 🔥 ध्यान दें: बैकएंड में slug से डेटा मंगाने वाला राउट (get-by-slug) होना चाहिए
        const result = await axios.get(`${serverUrl}/api/website/get-by-slug/${slug}`, {
          withCredentials: true,
        });

        console.log("Live site loaded successfully");
        setHtml(result.data.latestCode || result.data.website?.latestCode);
      } catch (error) {
        console.error(error);
        setError("site not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      handleGetWebsite();
    }
  }, [slug]);

  // 1. अगर साइट लोड हो रही हो
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-2 text-white font-sans">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase">Connecting to Production...</p>
      </div>
    );
  }

  // 2. अगर कोई एरर या साइट न मिले
  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
        <h1 className="text-4xl font-bold text-zinc-800 tracking-tight">404</h1>
        <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-widest">{error}</p>
      </div>
    );
  }

  // 3. कोड को सीधे बिना किसी iframe बकवास के फुल स्क्रीन पर रेंडर करना (ताकि ओरिजिनल वेबसाइट लगे)
  return (
    <div 
      className="w-full min-h-screen bg-white"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}

export default LiveSite;