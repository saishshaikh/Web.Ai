import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Globe, BarChart3, Activity, Rocket, Cpu, User, RefreshCw, CheckCircle, ExternalLink, Sparkles, Layers, Zap } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployingId, setDeployingId] = useState(null);
  const [deployProgress, setDeployProgress] = useState({});

  const fetchWebsites = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true });
      
      const sites = result.data.websites || result.data;
      
      const updatedSites = sites.map(site => ({
        ...site,
        isDeployed: site.isDeployed || site.deployed || !!site.deployUrl
      }));
      
      setWebsites(updatedSites);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  const handleDashboardDeploy = async (id) => {
    try {
      setDeployingId(id);
      setDeployProgress(prev => ({ ...prev, [id]: 0 }));
      
      const progressInterval = setInterval(() => {
        setDeployProgress(prev => {
          const current = prev[id] || 0;
          if (current >= 95) {
            clearInterval(progressInterval);
            return { ...prev, [id]: 95 };
          }
          const increment = Math.random() * 6 + 2;
          return { ...prev, [id]: Math.min(current + increment, 95) };
        });
      }, 300);

      const result = await axios.post(`${serverUrl}/api/website/deploy/${id}`, {}, { withCredentials: true });
      
      clearInterval(progressInterval);
      setDeployProgress(prev => ({ ...prev, [id]: 100 }));
      
      setWebsites(prev => prev.map(s => 
        s._id === id ? { 
          ...s, 
          deployUrl: result.data.url, 
          isDeployed: true,
          deployed: true
        } : s
      ));
      
    } catch (err) { 
      alert("Deployment failed!"); 
      setDeployProgress(prev => ({ ...prev, [id]: 0 }));
    }
    finally { 
      setTimeout(() => {
        setDeployingId(null);
        setDeployProgress(prev => ({ ...prev, [id]: 0 }));
      }, 2000);
    }
  };

  const liveCount = websites.filter(s => s.isDeployed || s.deployUrl).length;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all hover:scale-105">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/Generate")} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-white to-zinc-200 text-black text-xs font-bold hover:scale-105 transition shadow-lg shadow-white/10 flex items-center gap-2">
              <Plus size={14} /> New Project
            </button>
            <button onClick={fetchWebsites} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition hover:rotate-180 duration-500">
              <RefreshCw size={16} />
            </button>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 transition">
              <span className="text-xs font-bold">{userData?.name || "User"}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <User size={14} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Animated Welcome Message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {userData?.name?.split(' ')[0] || "Designer"}
            </span>{" "}
            <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-zinc-500 mt-2 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" />
            Manage your AI-generated projects and deployments.
          </p>
        </motion.div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Projects", value: websites.length, icon: <Layers size={16}/>, color: "from-blue-500 to-cyan-500" },
            { label: "Live Active", value: liveCount, icon: <Globe size={16}/>, color: "from-emerald-500 to-teal-500" },
            { label: "System Health", value: "Optimal", icon: <Activity size={16}/>, color: "from-purple-500 to-pink-500" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: i * 0.1 }}
              className="bg-[#0d0d0d] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition group"
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} p-2 mb-4`}>
                {stat.icon}
              </div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
              <motion.h2 
                key={stat.value}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold"
              >
                {stat.value}
              </motion.h2>
            </motion.div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-zinc-800/50"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-zinc-800/50 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-800/50 rounded w-1/2"></div>
                    <div className="flex gap-3">
                      <div className="h-12 bg-zinc-800/50 rounded-xl flex-1"></div>
                      <div className="h-12 bg-zinc-800/50 rounded-xl flex-[2]"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              websites.map((site, index) => (
                <motion.div 
                  key={site._id} 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
                >
                  {/* Thumbnail Section */}
                  <div className="w-full h-48 bg-black relative overflow-hidden flex items-center justify-center">
                    {site.thumbnail ? (
                      <motion.img 
                        src={site.thumbnail} 
                        alt={site.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                      />
                    ) : site.isDeployed || site.deployUrl ? (
                      <iframe
                        src={site.deployUrl}
                        className="w-full h-full border-none"
                        sandbox="allow-scripts allow-same-origin"
                        loading="lazy"
                      />
                    ) : (
                      <Cpu size={48} className="text-zinc-800 group-hover:text-zinc-600 transition"/>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                    
                    {/* Status Badge */}
                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="absolute top-4 right-4"
                    >
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-xl flex items-center gap-1.5 ${
                        site.isDeployed || site.deployUrl 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                          : "bg-zinc-800/50 text-zinc-400 border border-white/5"
                      }`}>
                        {(site.isDeployed || site.deployUrl) ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                            Draft
                          </>
                        )}
                      </span>
                    </motion.div>

                    {/* Deploy Progress */}
                    {deployingId === site._id && deployProgress[site._id] > 0 && deployProgress[site._id] < 100 && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Zap size={10} className="text-indigo-400 animate-pulse" />
                            Deploying...
                          </span>
                          <span>{Math.round(deployProgress[site._id])}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${deployProgress[site._id]}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Success Badge */}
                    {deployingId === site._id && deployProgress[site._id] === 100 && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle size={48} className="text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">Deployed!</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold truncate flex items-center gap-2">
                        {site.title}
                        {(site.isDeployed || site.deployUrl) && (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full animate-pulse">
                            LIVE
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    <p className="text-zinc-500 text-xs truncate">
                      {site.updatedAt ? `Updated ${new Date(site.updatedAt).toLocaleDateString()}` : "AI Generated"}
                    </p>
                    
                    {/* 🔥 Actions Buttons */}
                    <div className="flex gap-3 mt-6">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/editor/${site._id}`)} 
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition border border-white/5 hover:border-white/10"
                      >
                        Edit
                      </motion.button>
                      
                      {/* ✅ View Live - अगर डिप्लॉय है */}
                      {(site.isDeployed || site.deployUrl) ? (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // ✅ सही URL बनाएं
                            const liveUrl = site.deployUrl || `${window.location.origin}/site/${site.slug}`;
                            console.log("🔗 Opening:", liveUrl);
                            window.open(liveUrl, "_blank");
                          }} 
                          className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                        >
                          <ExternalLink size={14}/> View Live
                        </motion.button>
                      ) : (
                        /* ❌ Deploy - अगर डिप्लॉय नहीं है */
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDashboardDeploy(site._id)} 
                          disabled={deployingId === site._id}
                          className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                          {deployingId === site._id ? (
                            deployProgress[site._id] === 100 ? (
                              <><CheckCircle size={14}/> Done!</>
                            ) : (
                              <><Rocket size={14} className="animate-bounce"/> Deploying...</>
                            )
                          ) : (
                            <><Rocket size={14}/> Deploy</>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && websites.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
              <Plus size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
            <p className="text-zinc-500 text-sm mb-6">Create your first AI-powered website now!</p>
            <button onClick={() => navigate("/Generate")} className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition">
              Create Project
            </button>
          </motion.div>
        )}
      </main>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;