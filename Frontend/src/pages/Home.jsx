import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import LoginModal from "../Component/LoginModal";
import { Coins, LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import { setUserData } from "../redux/userSlice"; 

const Home = () => {
  const [openlogin, setopenlogin] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  // Backend URL
  const serverUrl = "http://localhost:8000"; 

  // Redux State
  const { userData } = useSelector((state) => state.user);

  // ड्रॉपडाउन के बाहर क्लिक करने पर उसे बंद करने के लिए
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout Logic
  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(setUserData(null)); 
      setOpenDropdown(false); 
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-[#050816] to-black text-white overflow-hidden">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.3,
          ease: "easeOut",
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            WebGen.AI
          </div>

          <div className="flex items-center gap-5">
            {/* Header mein Pricing section dhundein aur ise replace karein */}

<div 
  onClick={() => navigate("/pricing")} 
  className="hidden md:inline text-sm text-zinc-400 hover:text-indigo-400 cursor-pointer transition-colors duration-300"
>
  Pricing
</div>

            {!userData ? (
              <button
                onClick={() => setopenlogin(true)}
                className="px-4 py-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20"
              >
                Get Started
              </button>
            ) : (
              /* Profile Section with Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="flex items-center gap-2 group bg-white/5 hover:bg-white/10 p-1.5 pr-3 rounded-full border border-white/10 transition-all duration-300"
                >
                  <img
                    src={userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&size=128`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-indigo-500 object-cover"
                  />
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-indigo-300 transition-colors duration-300 hidden sm:inline">
                    {userData.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${openDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 rounded-xl bg-[#0b0f19] border border-white/10 p-2 shadow-2xl backdrop-blur-xl z-50"
                    >
                      {/* Credits Section */}
                      <div className="flex items-center justify-between p-2.5 mb-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400/80 tracking-wider uppercase">
                            Credits
                          </span>
                        </div>
                        <span className="text-sm font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                          {userData.credits ?? 0}
                        </span>
                      </div>

                      {/* Dashboard Link */}
                      <button 
                        onClick={() => { navigate("/Dashboard"); setOpenDropdown(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        Dashboard
                      </button>

                      {/* About Me Link */}
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200">
                        <User className="w-4 h-4 text-purple-400" />
                        About Me
                      </button>

                      <div className="h-[1px] bg-white/10 my-1.5" />

                      {/* Logout Button */}
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>
        </div>
      </motion.div>

      {/* Hero */}
      <section className="pt-44 pb-32 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-5xl md:text-6xl font-bold leading-tight"
        >
          Build Stunning Websites{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            With AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto"
        >
          Describe your idea and let AI generate a modern,
          responsive, production-ready website.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => userData ? navigate("/Dashboard") : setopenlogin(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/30"
          >
            {userData ? "Go to Dashboard" : "Get Started"}
          </motion.button>
        </motion.div>
      </section>

      {/* Cards */}
      <section className="relative max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            "AI-Powered Generation",
            "Clean & Modern Code",
            "Deploy in One Click",
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-lg hover:border-indigo-400/40 transition-all duration-300 shadow-lg shadow-black/30"
            >
              <h2 className="text-xl font-semibold mb-4">
                {item}
              </h2>
              <p className="text-zinc-400">
                WebGen.AI builds real websites with clean code,
                smooth animations, responsive design and scalable
                structure.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-zinc-500 border-t border-white/10">
        © {new Date().getFullYear()} WebGen.AI. All rights reserved.
      </footer>

      <LoginModal
        open={openlogin}
        onClose={() => setopenlogin(false)}
      />
    </div>
  );
};

export default Home;